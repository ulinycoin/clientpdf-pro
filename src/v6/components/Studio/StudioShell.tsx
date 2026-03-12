import { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlatform } from '../../../app/react/platform-context';
import { useStudioStore, PageItem, StudioDocument as IStudioDocument, StudioState } from './studio-store';
import { StudioDocument } from './StudioDocument';
import { DetachedPageObject } from './DetachedPageObject';
import { StudioFloatingMenu } from './StudioFloatingMenu';
import { StudioModeSwitcher } from './StudioModeSwitcher';
import { ThumbnailService } from '../../studio/thumbnail/thumbnail-service';
import type { StudioReturnContext, StudioToolRouteState } from '../../studio/navigation/studio-tool-context';
import { getPdfJs, getPdfLib } from '../../services/pdf/pdf-loader';
import { StudioInPlaceEditor } from './StudioInPlaceEditor';

export interface StudioShellProps {
    onFilesDropped?: (files: File[]) => void;
}

const CARD_WIDTH = 200;
const CARD_HEIGHT = 280;
const CARD_GAP = 20;
const DOC_WRAP_PADDING_X = 80;
const DOC_WRAP_PADDING_Y = 80;
const DOC_WRAP_GAP_X = 48;
const DOC_WRAP_GAP_Y = 56;
const DOC_BLOCK_HEIGHT = CARD_HEIGHT + CARD_GAP + 40;
const ZOOM_MIN = 0.35;
const ZOOM_MAX = 6;
const ZOOM_STEP = 1.2;

interface NewDocumentDraft {
    id: string;
    name: string;
    pages: PageItem[];
    isModified: boolean;
}

function toProtectedName(name: string): string {
    const trimmed = name.trim();
    const lower = trimmed.toLowerCase();
    if (lower.endsWith('(protected)') || lower.endsWith('(protected).pdf')) {
        return trimmed;
    }
    if (lower.endsWith('.pdf')) {
        return `${trimmed.slice(0, -4)} (protected).pdf`;
    }
    return `${trimmed} (protected)`;
}

function isPdfPasswordError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
        return false;
    }
    const maybe = error as {
        name?: unknown;
        code?: unknown;
        message?: unknown;
    };
    const name = typeof maybe.name === 'string' ? maybe.name.toLowerCase() : '';
    const code = typeof maybe.code === 'number' ? maybe.code : null;
    const message = typeof maybe.message === 'string' ? maybe.message.toLowerCase() : '';
    return (
        name.includes('passwordexception')
        || message.includes('passwordexception')
        || message.includes('encrypted')
        || code === 1
        || code === 2
    );
}

function clampScale(scale: number): number {
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, scale));
}

function estimateDocumentWidth(pageCount: number, gridColumns: number): number {
    const cols = Math.min(pageCount || 1, gridColumns);
    return Math.max(240, cols * (CARD_WIDTH + CARD_GAP) + 20);
}

function estimateDocumentHeight(pageCount: number, gridColumns: number): number {
    const cols = Math.min(pageCount || 1, gridColumns);
    const rows = Math.ceil(pageCount / cols) || 1;
    return Math.max(DOC_BLOCK_HEIGHT, rows * (CARD_HEIGHT + CARD_GAP) + 60);
}

function placeNewDocumentsInRows(
    existingDocs: IStudioDocument[],
    drafts: NewDocumentDraft[],
    viewportWidth: number,
    gridColumns: number
): IStudioDocument[] {
    if (drafts.length === 0) {
        return [];
    }

    const startX = DOC_WRAP_PADDING_X;
    const startY = Math.max(
        DOC_WRAP_PADDING_Y,
        ...existingDocs.map((doc) => doc.y + estimateDocumentHeight(doc.pages.length, gridColumns) + DOC_WRAP_GAP_Y),
    );
    const usableWidth = Math.max(420, viewportWidth - DOC_WRAP_PADDING_X * 2);

    const positioned: IStudioDocument[] = [];
    let cursorX = startX;
    let cursorY = startY;
    let rowHeight = 0;

    for (const draft of drafts) {
        const width = estimateDocumentWidth(draft.pages.length, gridColumns);
        const height = estimateDocumentHeight(draft.pages.length, gridColumns);
        const wouldOverflow = cursorX !== startX && (cursorX - startX + width > usableWidth);

        if (wouldOverflow) {
            cursorX = startX;
            cursorY += rowHeight + DOC_WRAP_GAP_Y;
            rowHeight = 0;
        }

        positioned.push({
            ...draft,
            x: cursorX,
            y: cursorY,
        });

        cursorX += width + DOC_WRAP_GAP_X;
        rowHeight = Math.max(rowHeight, height);
    }

    return positioned;
}

function computeDocumentsBounds(docs: IStudioDocument[], gridColumns: number): { minX: number; minY: number; maxX: number; maxY: number } {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const doc of docs) {
        const docWidth = estimateDocumentWidth(doc.pages.length, gridColumns);
        const docHeight = estimateDocumentHeight(doc.pages.length, gridColumns);
        minX = Math.min(minX, doc.x - 20);
        minY = Math.min(minY, doc.y - 40);
        maxX = Math.max(maxX, doc.x + docWidth + 20);
        maxY = Math.max(maxY, doc.y + docHeight + 20);
    }

    return { minX, minY, maxX, maxY };
}

export function StudioShell({ onFilesDropped }: StudioShellProps) {
    const uiRunIdRef = useRef(crypto.randomUUID());
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const studioViewScale = useStudioStore((s: StudioState) => s.studioViewScale);
    const studioViewPosition = useStudioStore((s: StudioState) => s.studioViewPosition);
    const setStudioViewport = useStudioStore((s: StudioState) => s.setStudioViewport);
    const gridColumns = useStudioStore((s: StudioState) => s.gridColumns);
    const setGridColumns = useStudioStore((s: StudioState) => s.setGridColumns);
    const [viewScale, setViewScale] = useState(studioViewScale);
    const [viewPosition, setViewPosition] = useState(studioViewPosition);
    const containerRef = useRef<HTMLDivElement>(null);
    const uploadInputRef = useRef<HTMLInputElement | null>(null);
    const stageRef = useRef<Konva.Stage | null>(null);
    const stagePixelRatio = Math.max(1, Math.ceil(window.devicePixelRatio || 1));

    const location = useLocation();
    const navigate = useNavigate();
    const { runtime } = usePlatform();
    const isDraggingFile = useStudioStore((s: StudioState) => s.isDraggingFile);
    const setDraggingFile = useStudioStore((s: StudioState) => s.setDraggingFile);
    const documents = useStudioStore((s: StudioState) => s.documents);
    const detachedPages = useStudioStore((s: StudioState) => s.detachedPages);
    const addDocument = useStudioStore((s: StudioState) => s.addDocument);
    const setDocuments = useStudioStore((s: StudioState) => s.setDocuments);
    const setActiveDocument = useStudioStore((s: StudioState) => s.setActiveDocument);
    const activeDocumentId = useStudioStore((s: StudioState) => s.activeDocumentId);
    const selection = useStudioStore((s: StudioState) => s.selection);
    const setSelection = useStudioStore((s: StudioState) => s.setSelection);
    const setInteractionMode = useStudioStore((s: StudioState) => s.setInteractionMode);
    const hasFiles = documents.length > 0 || detachedPages.length > 0;
    const pageClipboardRef = useRef<PageItem[]>([]);
    const [hasClipboardPages, setHasClipboardPages] = useState(false);

    useEffect(() => {
        setStudioViewport(viewScale, viewPosition, dimensions);
    }, [setStudioViewport, viewPosition, viewScale, dimensions]);

    const notifyStudioError = useCallback((message: string) => {
        runtime.telemetry.track({
            type: 'UI_TOAST_SHOWN',
            runId: uiRunIdRef.current,
            toolId: 'studio',
            message,
            level: 'error',
        });
    }, [runtime.telemetry]);

    const fitToDocuments = useCallback((targetDocs: IStudioDocument[]) => {
        if (targetDocs.length === 0) {
            setViewScale(1);
            setViewPosition({ x: 0, y: 0 });
            return;
        }

        const bounds = computeDocumentsBounds(targetDocs, gridColumns);
        const boundsWidth = Math.max(1, bounds.maxX - bounds.minX);
        const boundsHeight = Math.max(1, bounds.maxY - bounds.minY);
        const padding = 56;
        const fitScale = clampScale(Math.min(
            (dimensions.width - padding * 2) / boundsWidth,
            (dimensions.height - padding * 2) / boundsHeight,
        ));
        const contentWidth = boundsWidth * fitScale;
        const contentHeight = boundsHeight * fitScale;
        const nextX = (dimensions.width - contentWidth) / 2 - bounds.minX * fitScale;
        const nextY = (dimensions.height - contentHeight) / 2 - bounds.minY * fitScale;

        setViewScale(fitScale);
        setViewPosition({ x: nextX, y: nextY });
    }, [dimensions.height, dimensions.width, gridColumns]);

    const zoomAtScreenPoint = useCallback((point: { x: number; y: number }, direction: 'in' | 'out') => {
        const oldScale = viewScale;
        const factor = direction === 'in' ? ZOOM_STEP : 1 / ZOOM_STEP;
        const nextScale = clampScale(oldScale * factor);
        if (Math.abs(nextScale - oldScale) < 0.0001) {
            return;
        }

        const worldX = (point.x - viewPosition.x) / oldScale;
        const worldY = (point.y - viewPosition.y) / oldScale;
        const nextX = point.x - worldX * nextScale;
        const nextY = point.y - worldY * nextScale;

        setViewScale(nextScale);
        setViewPosition({ x: nextX, y: nextY });
    }, [viewPosition.x, viewPosition.y, viewScale]);

    const buildPagesFromFileId = useCallback(async (fileId: string): Promise<{ name: string; pages: PageItem[] }> => {
        const pdfjs = await getPdfJs();
        const entry = await runtime.vfs.read(fileId);
        const blob = await entry.getBlob();
        const buffer = await blob.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        const pages: PageItem[] = [];
        for (let i = 0; i < numPages; i++) {
            const page = await pdf.getPage(i + 1);
            const thumb = await ThumbnailService.generateThumbnailFromPage(page);
            pages.push({
                id: crypto.randomUUID(),
                fileId,
                pageIndex: i,
                thumbnailUrl: thumb,
                rotation: 0
            });
        }

        await pdf.destroy();
        return { name: entry.getName(), pages };
    }, [runtime.vfs]);

    const buildEncryptedFallbackFromSource = useCallback(async (
        fileId: string,
        sourceDoc: IStudioDocument,
    ): Promise<{ name: string; pages: PageItem[] }> => {
        const entry = await runtime.vfs.read(fileId);
        const pages = sourceDoc.pages.map((page) => ({
            id: crypto.randomUUID(),
            fileId,
            pageIndex: page.pageIndex,
            thumbnailUrl: page.thumbnailUrl,
            rotation: page.rotation,
        }));
        return { name: entry.getName(), pages };
    }, [runtime.vfs]);

    const applyReturnContext = useCallback((ctx: StudioReturnContext | undefined) => {
        if (!ctx) {
            return;
        }
        setActiveDocument(ctx.activeDocumentId);
        setSelection(ctx.selection);
        setInteractionMode(ctx.interactionMode);
        setViewScale(clampScale(ctx.viewScale));
        setViewPosition(ctx.viewPosition);
    }, [setActiveDocument, setInteractionMode, setSelection]);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDraggingFile(true);
    }, [setDraggingFile]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDraggingFile(false);
    }, [setDraggingFile]);

    const handleIncomingFiles = useCallback(async (files: File[], fromDrop: boolean) => {
        const drafts: NewDocumentDraft[] = [];
        if (files.length === 0) {
            return;
        }
        if (fromDrop) {
            onFilesDropped?.(files);
        }

        for (let file of files) {
            try {
                // If it's an image, wrap it in a PDF on the fly
                if (file.type.startsWith('image/')) {
                    const { PDFDocument } = await getPdfLib();
                    const pdfDoc = await PDFDocument.create();
                    const imageBytes = await file.arrayBuffer();
                    let embeddedImage;
                    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                        embeddedImage = await pdfDoc.embedJpg(imageBytes);
                    } else if (file.type === 'image/png') {
                        embeddedImage = await pdfDoc.embedPng(imageBytes);
                    } else {
                        throw new Error(`Unsupported image type: ${file.type}`);
                    }

                    const { width, height } = embeddedImage.scale(1);
                    const page = pdfDoc.addPage([width, height]);
                    page.drawImage(embeddedImage, {
                        x: 0,
                        y: 0,
                        width,
                        height,
                    });

                    const pdfBytes = await pdfDoc.save();
                    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                    file = new File([pdfBytes as any], `${baseName}.pdf`, { type: 'application/pdf' });
                }

                // 1. Save to VFS
                const pdfjs = await getPdfJs();
                const entry = await runtime.vfs.write(file);
                const buffer = await file.arrayBuffer();

                // 2. Load PDF once
                const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
                const pdf = await loadingTask.promise;
                const numPages = pdf.numPages;

                const pages: PageItem[] = [];

                // 3. Generate pages and thumbnails
                for (let i = 0; i < numPages; i++) {
                    const page = await pdf.getPage(i + 1);
                    const thumb = await ThumbnailService.generateThumbnailFromPage(page);
                    pages.push({
                        id: crypto.randomUUID(),
                        fileId: entry.id,
                        pageIndex: i,
                        thumbnailUrl: thumb,
                        rotation: 0
                    });
                }

                // Clean up pdf object
                await pdf.destroy();
                drafts.push({
                    id: crypto.randomUUID(),
                    name: file.name,
                    pages,
                    isModified: false,
                });
            } catch (error) {
                console.error('Failed to load file into Studio:', error);
                const message = error instanceof Error ? error.message : 'Failed to load file into Studio.';
                notifyStudioError(message);
            }
        }

        const positionedDocs = placeNewDocumentsInRows(documents, drafts, dimensions.width, gridColumns);
        for (const doc of positionedDocs) {
            addDocument(doc);
        }
        if (positionedDocs.length > 0) {
            fitToDocuments([...documents, ...positionedDocs]);
        }
    }, [addDocument, dimensions.width, documents, fitToDocuments, notifyStudioError, onFilesDropped, runtime.vfs, gridColumns]);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setDraggingFile(false);
        await handleIncomingFiles(Array.from(e.dataTransfer.files), true);
    }, [handleIncomingFiles, setDraggingFile]);

    const handleUploadInputChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        await handleIncomingFiles(files, false);
        event.target.value = '';
    }, [handleIncomingFiles]);

    const openUploadDialog = useCallback(() => {
        uploadInputRef.current?.click();
    }, []);

    const copySelectedPages = useCallback(() => {
        if (selection.length === 0) {
            return false;
        }
        const selectionSet = new Set(selection.map((item) => item.pageId));
        const orderedPages: PageItem[] = [];
        for (const doc of documents) {
            for (const page of doc.pages) {
                if (selectionSet.has(page.id)) {
                    orderedPages.push(page);
                }
            }
        }
        if (orderedPages.length === 0) {
            return false;
        }
        pageClipboardRef.current = orderedPages;
        setHasClipboardPages(true);
        return true;
    }, [documents, selection]);

    const pasteSelectedPages = useCallback(() => {
        if (!activeDocumentId || pageClipboardRef.current.length === 0) {
            return false;
        }
        const targetDoc = documents.find((doc) => doc.id === activeDocumentId);
        if (!targetDoc) {
            return false;
        }

        const clonedPages: PageItem[] = pageClipboardRef.current.map((page) => ({
            ...page,
            id: crypto.randomUUID(),
        }));
        const nextDocuments = documents.map((doc) => {
            if (doc.id !== activeDocumentId) {
                return doc;
            }
            return {
                ...doc,
                pages: [...doc.pages, ...clonedPages],
                isModified: true,
            };
        });
        setDocuments(nextDocuments);
        setSelection(clonedPages.map((page) => ({ docId: activeDocumentId, pageId: page.id })));
        return true;
    }, [activeDocumentId, documents, setDocuments, setSelection]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const isTypingInInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
            if (isTypingInInput) {
                return;
            }

            const key = event.key.toLowerCase();
            const isModifierPressed = event.ctrlKey || event.metaKey;
            const isOpenShortcut = (event.ctrlKey || event.metaKey) && key === 'o';
            const isQuickUploadShortcut = !event.ctrlKey && !event.metaKey && !event.altKey && key === 'u';
            const isCopyShortcut = isModifierPressed && !event.shiftKey && !event.altKey && key === 'c';
            const isPasteShortcut = isModifierPressed && !event.shiftKey && !event.altKey && key === 'v';

            if (isCopyShortcut) {
                if (copySelectedPages()) {
                    event.preventDefault();
                }
                return;
            }

            if (isPasteShortcut) {
                if (pasteSelectedPages()) {
                    event.preventDefault();
                }
                return;
            }

            if (!isOpenShortcut && !isQuickUploadShortcut) {
                return;
            }

            event.preventDefault();
            openUploadDialog();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [copySelectedPages, openUploadDialog, pasteSelectedPages]);

    const handleStageWheel = useCallback((event: KonvaEventObject<WheelEvent>) => {
        const targetNode = event.target;
        const isOverDocument = Boolean(targetNode?.findAncestor('.document', true));
        const isOverPage = Boolean(targetNode?.findAncestor('.page-object', true));
        const isOverDetachedPage = Boolean(targetNode?.findAncestor('.detached-page-object', true));

        if (!isOverDocument && !isOverPage && !isOverDetachedPage) {
            return;
        }

        event.evt.preventDefault();
        const stage = stageRef.current;
        if (!stage) {
            return;
        }
        const pointer = stage.getPointerPosition();
        if (!pointer) {
            return;
        }
        zoomAtScreenPoint(pointer, event.evt.deltaY > 0 ? 'out' : 'in');
    }, [zoomAtScreenPoint]);

    const zoomIn = useCallback(() => {
        zoomAtScreenPoint({ x: dimensions.width / 2, y: dimensions.height / 2 }, 'in');
    }, [dimensions.height, dimensions.width, zoomAtScreenPoint]);

    const zoomOut = useCallback(() => {
        zoomAtScreenPoint({ x: dimensions.width / 2, y: dimensions.height / 2 }, 'out');
    }, [dimensions.height, dimensions.width, zoomAtScreenPoint]);

    useEffect(() => {
        const routeState = (location.state as StudioToolRouteState | null) ?? null;
        const toolResult = routeState?.studioToolResult;
        const returnContext = routeState?.studioReturnContext;
        if (!toolResult || toolResult.outputIds.length === 0) {
            if (routeState?.source === 'studio' && returnContext) {
                applyReturnContext(returnContext);
                navigate('/studio', { replace: true, state: null });
            }
            return;
        }

        let cancelled = false;
        void (async () => {
            try {
                const { outputIds, studioContext } = toolResult;
                const sourceDocId = studioContext?.documentId ?? studioContext?.selectedPages[0]?.docId ?? null;
                const sourceDoc = sourceDocId
                    ? documents.find((doc) => doc.id === sourceDocId) ?? null
                    : null;
                const returnDoc = returnContext?.activeDocumentId
                    ? documents.find((doc) => doc.id === returnContext.activeDocumentId) ?? null
                    : null;
                const fallbackDoc = sourceDoc ?? returnDoc;
                const newDocs: IStudioDocument[] = [];

                for (let index = 0; index < outputIds.length; index += 1) {
                    let rebuilt: { name: string; pages: PageItem[] };
                    try {
                        rebuilt = await buildPagesFromFileId(outputIds[index]);
                    } catch (error) {
                        const isPasswordProtected = isPdfPasswordError(error);
                        const isProtectTool = toolResult.toolId === 'protect-pdf';
                        if (isProtectTool && isPasswordProtected && fallbackDoc) {
                            rebuilt = await buildEncryptedFallbackFromSource(outputIds[index], fallbackDoc);
                        } else {
                            throw error;
                        }
                    }
                    if (cancelled) {
                        break;
                    }
                    const x = sourceDoc
                        ? sourceDoc.x + estimateDocumentWidth(sourceDoc.pages.length, gridColumns) + DOC_WRAP_GAP_X + index * (CARD_WIDTH + DOC_WRAP_GAP_X)
                        : 100;
                    const y = sourceDoc ? sourceDoc.y : (100 + index * (estimateDocumentHeight(rebuilt.pages.length, gridColumns) + 50));
                    newDocs.push({
                        id: crypto.randomUUID(),
                        name: rebuilt.name,
                        x,
                        y,
                        pages: rebuilt.pages,
                        isModified: true,
                    });
                }

                if (newDocs.length > 0) {
                    if (toolResult.toolId === 'protect-pdf' && sourceDoc) {
                        const protectedDoc = newDocs[0];
                        const nextDocuments = documents.map((doc) => {
                            if (doc.id !== sourceDoc.id) {
                                return doc;
                            }
                            return {
                                ...doc,
                                name: toProtectedName(doc.name),
                                pages: protectedDoc.pages,
                                isModified: true,
                            };
                        });
                        setDocuments(nextDocuments);
                        setActiveDocument(sourceDoc.id);
                    } else if (sourceDoc) {
                        const sourceIndex = documents.findIndex((doc) => doc.id === sourceDoc.id);
                        if (sourceIndex >= 0) {
                            const nextDocuments = [...documents];
                            nextDocuments.splice(sourceIndex + 1, 0, ...newDocs);
                            setDocuments(nextDocuments);
                        } else {
                            for (const doc of newDocs) {
                                addDocument(doc);
                            }
                        }
                    } else {
                        for (const doc of newDocs) {
                            addDocument(doc);
                        }
                    }
                }
                setSelection([]);
            } catch (error) {
                if (!cancelled) {
                    console.error('Failed to apply tool result in Studio:', error);
                    const message = error instanceof Error ? error.message : 'Failed to apply tool result in Studio.';
                    notifyStudioError(message);
                }
            } finally {
                if (!cancelled) {
                    applyReturnContext(returnContext);
                    navigate('/studio', { replace: true, state: null });
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        addDocument,
        applyReturnContext,
        buildPagesFromFileId,
        buildEncryptedFallbackFromSource,
        documents,
        fitToDocuments,
        location.state,
        navigate,
        setDocuments,
        setActiveDocument,
        setInteractionMode,
        setSelection,
        gridColumns,
        notifyStudioError,
    ]);

    useEffect(() => {
        if (documents.length === 0) {
            setViewScale(1);
            setViewPosition({ x: 0, y: 0 });
            return;
        }
        fitToDocuments(documents);
    }, [documents.length, fitToDocuments]);

    return (
        <div
            ref={containerRef}
            className={`studio-shell-container ${isDraggingFile ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <Stage
                ref={stageRef}
                width={dimensions.width}
                height={dimensions.height}
                pixelRatio={stagePixelRatio}
                draggable={hasFiles}
                x={viewPosition.x}
                y={viewPosition.y}
                scaleX={viewScale}
                scaleY={viewScale}
                onWheel={handleStageWheel}
                onDragEnd={(event) => {
                    if (event.target !== event.currentTarget) {
                        return;
                    }
                    setViewPosition({
                        x: event.currentTarget.x(),
                        y: event.currentTarget.y(),
                    });
                }}
            >
                <Layer>
                    <Rect
                        x={-5000}
                        y={-5000}
                        width={10000}
                        height={10000}
                        fillLinearGradientStartPoint={{ x: -5000, y: -5000 }}
                        fillLinearGradientEndPoint={{ x: 5000, y: 5000 }}
                        fillLinearGradientColorStops={[
                            0,
                            'rgba(28, 52, 74, 0.72)',
                            0.45,
                            'rgba(20, 38, 56, 0.66)',
                            1,
                            'rgba(10, 20, 30, 0.58)',
                        ]}
                    />
                    {hasFiles && (
                        <>
                            {documents.map((doc: IStudioDocument) => (
                                <StudioDocument key={doc.id} doc={doc} />
                            ))}
                            {detachedPages.map((page) => (
                                <DetachedPageObject key={page.id} page={page} />
                            ))}
                        </>
                    )}
                </Layer>
            </Stage>
            <div className="studio-viewport-controls animate-fade-in">
                <div className="studio-viewport-section studio-viewport-section-left">
                    <StudioModeSwitcher />
                </div>
                <div className="studio-viewport-section studio-viewport-section-center">
                    <button
                        className="studio-viewport-btn"
                        onClick={() => { copySelectedPages(); }}
                        title="Copy selected pages (Ctrl/Cmd+C)"
                        disabled={selection.length === 0}
                    >
                        Copy
                    </button>
                    <button
                        className="studio-viewport-btn"
                        onClick={() => { pasteSelectedPages(); }}
                        title="Paste copied pages (Ctrl/Cmd+V)"
                        disabled={!activeDocumentId || !hasClipboardPages}
                    >
                        Paste
                    </button>
                    <div className="studio-viewport-divider" />
                    <button className="studio-viewport-btn" onClick={zoomOut} title="Zoom out" disabled={!hasFiles}>-</button>
                    <span className="studio-viewport-scale">{Math.round(viewScale * 100)}%</span>
                    <button className="studio-viewport-btn" onClick={zoomIn} title="Zoom in" disabled={!hasFiles}>+</button>
                    <button className="studio-viewport-btn studio-viewport-btn-fit" onClick={() => fitToDocuments(documents)} title="Fit all documents" disabled={!hasFiles}>
                        Fit
                    </button>
                    <div className="studio-viewport-divider" />
                    <button
                        className={`studio-viewport-btn ${gridColumns === 3 ? 'active' : ''}`}
                        onClick={() => setGridColumns(3)}
                        title="Grid: 3 columns"
                        disabled={!hasFiles}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>
                    </button>
                    <button
                        className={`studio-viewport-btn ${gridColumns === 5 ? 'active' : ''}`}
                        onClick={() => setGridColumns(5)}
                        title="Grid: 5 columns overview"
                        disabled={!hasFiles}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
                    </button>
                </div>
                <div className="studio-viewport-section studio-viewport-section-right">
                    <button className="studio-viewport-btn studio-viewport-btn-upload" onClick={openUploadDialog} title="Upload files (U or Ctrl/Cmd+O)">
                    Upload
                    </button>
                </div>
            </div>
            <input
                ref={uploadInputRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={handleUploadInputChange}
            />
            {!useStudioStore.getState().activeEditPageId && <StudioFloatingMenu />}
            <StudioInPlaceEditor stageRef={stageRef} />
        </div>
    );
}
