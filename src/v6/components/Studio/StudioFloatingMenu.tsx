import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../../../app/react/platform-context';
import { DEFAULT_TOOL_CONTEXT } from '../../hooks/useWizardFlow';
import { PipelineRunner } from '../../studio/pipeline/PipelineRunner';
import type { IPipelineRecipe } from '../../studio/pipeline/types';
import { ThumbnailService } from '../../studio/thumbnail/thumbnail-service';
import { PageItem, StudioDocument, StudioState, useStudioStore } from './studio-store';
import { LinearIcon } from '../icons/linear-icon';
import { getPdfJs } from '../../services/pdf/pdf-loader';

export function StudioFloatingMenu() {
    const { runtime } = usePlatform();
    const navigate = useNavigate();
    const selection = useStudioStore((s: StudioState) => s.selection);
    const activeDocumentId = useStudioStore((s: StudioState) => s.activeDocumentId);
    const requestedInlineTool = useStudioStore((s: StudioState) => s.requestedInlineTool);
    const updateDocument = useStudioStore((s: StudioState) => s.updateDocument);
    const setActiveDocument = useStudioStore((s: StudioState) => s.setActiveDocument);
    const requestInlineTool = useStudioStore((s: StudioState) => s.requestInlineTool);
    const documents = useStudioStore((s: StudioState) => s.documents);
    const clearSelection = () => useStudioStore.getState().setSelection([]);
    const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressError, setCompressError] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const dragStateRef = useRef<{ active: boolean; offsetX: number; offsetY: number }>({
        active: false,
        offsetX: 0,
        offsetY: 0,
    });

    const activeDocument = useMemo(
        () => documents.find((doc: StudioDocument) => doc.id === activeDocumentId) ?? null,
        [activeDocumentId, documents],
    );
    const canCompress = (activeDocument?.pages.length ?? 0) > 0;
    const isCompressMode = requestedInlineTool === 'compress-pdf';

    useEffect(() => {
        const onMouseMove = (event: MouseEvent) => {
            if (!dragStateRef.current.active || !menuRef.current) {
                return;
            }
            const offsetParent = menuRef.current.offsetParent as HTMLElement | null;
            const parentRect = offsetParent?.getBoundingClientRect();
            if (!parentRect) {
                return;
            }

            const menuRect = menuRef.current.getBoundingClientRect();
            const rawX = event.clientX - parentRect.left - dragStateRef.current.offsetX;
            const rawY = event.clientY - parentRect.top - dragStateRef.current.offsetY;
            const maxX = Math.max(8, parentRect.width - menuRect.width - 8);
            const maxY = Math.max(8, parentRect.height - menuRect.height - 8);
            const x = Math.max(8, Math.min(maxX, rawX));
            const y = Math.max(8, Math.min(maxY, rawY));
            setMenuPosition({ x, y });
        };

        const onMouseUp = () => {
            dragStateRef.current.active = false;
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    const startMenuDrag = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button !== 0 || !menuRef.current) {
            return;
        }
        const menuRect = menuRef.current.getBoundingClientRect();
        dragStateRef.current = {
            active: true,
            offsetX: event.clientX - menuRect.left,
            offsetY: event.clientY - menuRect.top,
        };
        event.preventDefault();
    };

    const buildPagesFromFileId = async (fileId: string): Promise<PageItem[]> => {
        const pdfjs = await getPdfJs();
        const entry = await runtime.vfs.read(fileId);
        const blob = await entry.getBlob();
        const buffer = await blob.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;
        const pages: PageItem[] = [];

        for (let i = 0; i < pdf.numPages; i++) {
            const page = await pdf.getPage(i + 1);
            const thumb = await ThumbnailService.generateThumbnailFromPage(page);
            pages.push({
                id: crypto.randomUUID(),
                fileId,
                pageIndex: i,
                thumbnailUrl: thumb,
                rotation: 0,
            });
        }

        await pdf.destroy();
        return pages;
    };

    const processCompression = async () => {
        if (!canCompress || isCompressing) {
            return;
        }

        setCompressError(null);
        setIsCompressing(true);
        try {
            if (!activeDocument || activeDocument.pages.length === 0) {
                setCompressError('Select a workspace with pages.');
                return;
            }

            const sequence = activeDocument.pages.map((page: PageItem) => ({
                sourceFileId: page.fileId,
                pageIndex: page.pageIndex,
                rotation: page.rotation,
            }));
            const recipe: IPipelineRecipe = {
                inputs: Array.from(new Set(sequence.map((item) => item.sourceFileId))),
                operations: [{ type: 'reorder', sequence }],
                outputName: `${activeDocument.name || 'workspace'}.pdf`,
            };

            const runner = new PipelineRunner(runtime.vfs);
            const merged = await runner.execute(recipe);
            const mergedBytes = new Uint8Array(merged.buffer.byteLength);
            mergedBytes.set(merged.buffer);
            const mergedBlob = new Blob([mergedBytes], { type: 'application/pdf' });
            const mergedEntry = await runtime.vfs.write(mergedBlob);

            const result = await runtime.runner.execute(
                'compress-pdf',
                { inputIds: [mergedEntry.id], options: { quality } },
                DEFAULT_TOOL_CONTEXT,
            );

            if (result.type !== 'TOOL_RESULT' || result.outputIds.length === 0) {
                const reason = result.type === 'TOOL_ACCESS_DENIED'
                    ? (result.details ?? result.reason)
                    : result.type === 'TOOL_ERROR'
                        ? result.message
                        : 'Compression failed';
                setCompressError(reason || 'Compression failed');
                return;
            }

            const compressedFileId = result.outputIds[0];
            const compressedPages = await buildPagesFromFileId(compressedFileId);
            if (compressedPages.length === 0) {
                setCompressError('Compressed output is empty.');
                return;
            }

            updateDocument(activeDocument.id, {
                name: `${activeDocument.name} (Compressed)`,
                pages: compressedPages,
                isModified: true,
            });
            setActiveDocument(activeDocument.id);
            requestInlineTool(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Compression failed';
            setCompressError(message);
        } finally {
            setIsCompressing(false);
        }
    };

    const startEdit = () => {
        if (selection.length !== 1) return;
        const item = selection[0];
        const doc = documents.find(d => d.id === item.docId);
        const page = doc?.pages.find(p => p.id === item.pageId);
        if (!doc || !page) return;

        const sessionPayload = {
            docId: doc.id,
            pageId: page.id,
            pageIndex: page.pageIndex,
            fileId: page.fileId,
            initialTool: null
        };

        const params = new URLSearchParams(window.location.search);
        const useInplace = params.get('inplace_edit') === '1';

        if (useInplace) {
            useStudioStore.getState().startEditSession(sessionPayload);
            useStudioStore.getState().setActiveEditPageId(page.id);
            useStudioStore.getState().setSelection([]);
        } else {
            useStudioStore.getState().startEditSession(sessionPayload);
            useStudioStore.getState().setInteractionMode('edit');
            navigate('/studio/edit');
        }
    };

    if (selection.length === 0 && !isCompressMode) return null;

    return (
        <div
            ref={menuRef}
            className="studio-floating-menu animate-slide-up"
            style={menuPosition ? { left: `${menuPosition.x}px`, top: `${menuPosition.y}px`, bottom: 'auto', transform: 'none' } : undefined}
        >
            <div className="studio-menu-info studio-menu-drag-handle" onMouseDown={startMenuDrag} title="Drag">
                <span className="studio-menu-count">{selection.length}</span>
                <span>Selected</span>
            </div>
            {selection.length > 0 && (
                <>
                    <div className="studio-menu-divider" />
                    <div className="studio-menu-actions">
                        {selection.length === 1 && (
                            <button
                                className="menu-btn"
                                title="Edit page content"
                                onClick={startEdit}
                            >
                                <LinearIcon name="word" className="linear-icon" />
                                <span style={{ fontSize: '10px', fontWeight: 'bold' }}>EDIT</span>
                            </button>
                        )}
                        <button
                            className={`menu-btn ${isCompressMode ? 'active' : ''}`}
                            title="Compress selected file"
                            onClick={() => {
                                setCompressError(null);
                                requestInlineTool(isCompressMode ? null : 'compress-pdf');
                            }}
                        >
                            <LinearIcon name="compress" className="linear-icon" />
                            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>CMP</span>
                        </button>
                    </div>
                </>
            )}
            {isCompressMode && (
                <>
                    <div className="studio-menu-divider" />
                    <div className="studio-compress-panel">
                        <div className="studio-compress-levels">
                            {(['low', 'medium', 'high'] as const).map((level) => (
                                <button
                                    key={level}
                                    className={`studio-compress-level ${quality === level ? 'active' : ''}`}
                                    onClick={() => setQuality(level)}
                                    disabled={isCompressing}
                                >
                                    {level.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        {!canCompress && (
                            <p className="studio-compress-hint">
                                Select an active workspace with pages.
                            </p>
                        )}
                        {compressError && <p className="studio-compress-error">{compressError}</p>}
                        <button
                            className="studio-compress-process-btn"
                            onClick={processCompression}
                            disabled={!canCompress || isCompressing}
                        >
                            {isCompressing ? 'Processing...' : 'Process'}
                        </button>
                    </div>
                </>
            )}
            <div className="studio-menu-divider" />
            <button
                className="menu-btn btn-close"
                onClick={() => {
                    requestInlineTool(null);
                    clearSelection();
                }}
            >
                <LinearIcon name="x" className="linear-icon" />
            </button>
        </div>
    );
}
