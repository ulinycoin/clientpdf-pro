import { useEffect, useState, useMemo } from 'react';
import type Konva from 'konva';
import { useStudioStore, StudioState } from './studio-store';
import { StudioPageEditor } from './StudioPageEditor';
import { DraggableFloatingMenu } from './StudioDraggableFloatingMenu';
import { EditElement, TextLayerSpan } from './editor-types';
import { usePlatform } from '../../../app/react/platform-context';
import type { IWorkerCommand, WorkerStudioEditElement } from '../../../core/public/contracts';
import { defaultFilePreviewService } from '../../preview/preview-service';
import { getStudioEditMessages } from './studio-edit-i18n';

interface StudioInPlaceEditorProps {
    stageRef: React.RefObject<Konva.Stage | null>;
}

export function StudioInPlaceEditor({ stageRef }: StudioInPlaceEditorProps) {
    const { runtime } = usePlatform();
    const activeEditPageId = useStudioStore((s: StudioState) => s.activeEditPageId);
    const editSession = useStudioStore((s: StudioState) => s.editSession);
    const documents = useStudioStore((s: StudioState) => s.documents);
    const updatePage = useStudioStore((s: StudioState) => s.updatePage);
    const clearEditSession = useStudioStore((s: StudioState) => s.clearEditSession);
    const setActiveEditPageId = useStudioStore((s: StudioState) => s.setActiveEditPageId);

    const [elements, setElements] = useState<EditElement[]>([]);
    const [overlayRect, setOverlayRect] = useState<{ x: number, y: number, w: number, h: number, scale: number } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [textLayerSpans, setTextLayerSpans] = useState<TextLayerSpan[]>([]);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    const ui = useMemo(() => getStudioEditMessages(), []);

    const activePage = useMemo(() => {
        if (!activeEditPageId) return null;
        for (const doc of documents) {
            const page = doc.pages.find(p => p.id === activeEditPageId);
            if (page) return page;
        }
        return null;
    }, [activeEditPageId, documents]);

    // Sync loop using requestAnimationFrame
    useEffect(() => {
        if (!activeEditPageId || !stageRef.current) return;

        let rafId: number;
        const sync = () => {
            const stage = stageRef.current;
            if (!stage) return;
            const pageNode = stage.find('#' + activeEditPageId)[0];
            if (!pageNode) return;

            const box = pageNode.getClientRect();
            const stageScale = stage.scaleX();

            setOverlayRect((prev) => {
                if (
                    prev &&
                    Math.abs(prev.x - box.x) < 0.5 &&
                    Math.abs(prev.y - box.y) < 0.5 &&
                    Math.abs(prev.w - box.width) < 0.5 &&
                    Math.abs(prev.h - box.height) < 0.5 &&
                    Math.abs(prev.scale - stageScale) < 0.005
                ) {
                    return prev;
                }
                return {
                    x: box.x,
                    y: box.y,
                    w: box.width,
                    h: box.height,
                    scale: stageScale // We might use this for high-quality text rendering
                };
            });

            rafId = requestAnimationFrame(sync);
        };

        rafId = requestAnimationFrame(sync);
        return () => cancelAnimationFrame(rafId);
    }, [activeEditPageId, stageRef]);

    // Fetch text layer spans for in-place editor
    useEffect(() => {
        if (!activePage) return;
        const abortController = new AbortController();
        void (async () => {
            try {
                const command: IWorkerCommand = {
                    id: crypto.randomUUID(),
                    type: 'COMMAND',
                    payload: {
                        type: 'GET_PDF_TEXT_LAYER',
                        payload: { fileId: activePage.fileId, pageNumber: activePage.pageIndex + 1 },
                    },
                };
                const finalEvent = await runtime.workerOrchestrator.dispatch(command, undefined, abortController.signal);
                if (finalEvent.payload.type === 'TEXT_LAYER_RESULT') {
                    setTextLayerSpans(finalEvent.payload.payload.spans);
                }
            } catch (e) {
                // Silent catch
            }
        })();
        return () => abortController.abort();
    }, [activePage, runtime]);

    const handleSave = async () => {
        if (!activePage || isSaving) return;
        setIsSaving(true);
        try {
            const command: IWorkerCommand = {
                id: crypto.randomUUID(),
                type: 'COMMAND',
                payload: {
                    type: 'APPLY_STUDIO_TEXT_EDITS',
                    payload: {
                        fileId: activePage.fileId,
                        pageIndex: activePage.pageIndex,
                        elements: elements as WorkerStudioEditElement[],
                    },
                },
            };
            const finalEvent = await runtime.workerOrchestrator.dispatch(command);
            if (finalEvent.payload.type === 'STUDIO_TEXT_EDITS_APPLIED') {
                const preview = await defaultFilePreviewService.getPdfPagePreview(
                    runtime,
                    finalEvent.payload.payload.outputId,
                    activePage.pageIndex + 1,
                    { scale: 2 },
                );
                updatePage(editSession!.docId, activePage.id, {
                    fileId: finalEvent.payload.payload.outputId,
                    thumbnailUrl: preview?.thumbnailUrl ?? activePage.thumbnailUrl
                });
                handleCancel();
            }
        } catch (e) {
            setMessage(ui.saveFailed);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setActiveEditPageId(null);
        clearEditSession();
    };

    if (!activeEditPageId || !overlayRect || !activePage) return null;

    return (
        <div
            className="studio-inplace-editor-overlay"
            style={{
                position: 'fixed',
                left: overlayRect.x,
                top: overlayRect.y,
                width: overlayRect.w,
                height: overlayRect.h,
                zIndex: 1000,
                pointerEvents: 'none'
            }}
        >
            <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'auto' }}>
                <StudioPageEditor
                    page={activePage}
                    width={overlayRect.w}
                    height={overlayRect.h}
                    activeTool={editSession?.activeTool ?? null}
                    onActiveToolChange={(_newTool) => {
                        // Optionally sync back to session if needed
                    }}
                    isSelectMode={isSelectMode}
                    setIsSelectMode={setIsSelectMode}
                    textLayerSpans={textLayerSpans}
                    elements={elements}
                    onElementsChange={setElements}
                    selectedElementId={selectedElementId}
                    onSelectedElementIdChange={setSelectedElementId}
                    onFinish={handleSave}
                    onDiscard={handleCancel}
                />

                {selectedElementId && elements.find(e => e.id === selectedElementId) && (
                    <DraggableFloatingMenu
                        element={elements.find(e => e.id === selectedElementId)!}
                        onUpdate={(patch) => {
                            setElements(els => els.map(el => el.id === selectedElementId ? { ...el, ...patch } as any : el));
                        }}
                        onDelete={() => {
                            setElements(els => els.filter(el => el.id !== selectedElementId));
                            setSelectedElementId(null);
                        }}
                        onDuplicate={() => {
                            const original = elements.find(e => e.id === selectedElementId);
                            if (!original) return;
                            const newId = crypto.randomUUID();
                            const x = 'x' in original ? original.x + 0.05 : 0.05;
                            const y = 'y' in original ? original.y + 0.05 : 0.05;
                            setElements(els => [...els, { ...original, id: newId, x, y } as any]);
                            setSelectedElementId(newId);
                        }}
                        onDeselect={() => setSelectedElementId(null)}
                    />
                )}

                {message && <div className="studio-inplace-error">{message}</div>}
            </div>

            {/* Global Escape Hatch (backdrop-like but transparent) */}
            <div
                style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'auto' }}
                onPointerDown={(e) => {
                    if (e.target === e.currentTarget) handleCancel();
                }}
            />
        </div>
    );
}
