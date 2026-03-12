import React, { useRef } from 'react';
import { Group, Image, Rect, Text } from 'react-konva';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import useImage from 'use-image';
import { PageItem, StudioState, useStudioStore } from './studio-store';
import { usePlatform } from '../../../app/react/platform-context';
import { getPdfJs } from '../../services/pdf/pdf-loader';

// --- LRU Cache for High-Res Bitmaps ---
const HIGH_RES_CACHE_LIMIT = 30; // Max number of high-res canvases to keep in memory (approx 100-300MB depending on resolution)
const highResCache = new Map<string, HTMLCanvasElement>();

function getCachedHighRes(key: string): HTMLCanvasElement | undefined {
    const canvas = highResCache.get(key);
    if (canvas) {
        // Refresh position in LRU
        highResCache.delete(key);
        highResCache.set(key, canvas);
    }
    return canvas;
}

function setCachedHighRes(key: string, canvas: HTMLCanvasElement) {
    if (highResCache.size >= HIGH_RES_CACHE_LIMIT) {
        // Evict oldest (Map iterates in insertion order, so first key is oldest)
        const oldestKey = highResCache.keys().next().value;
        if (oldestKey) highResCache.delete(oldestKey);
    }
    highResCache.set(key, canvas);
}


interface PageObjectProps {
    page: PageItem;
    docId: string;
    x: number;
    y: number;
    currentIndex: number;
    shouldPrefetchOnly?: boolean;
}

// Define the type for a selection item
interface SelectionItem {
    docId: string;
    pageId: string;
}

export const PageObject: React.FC<PageObjectProps> = ({ page, docId, x, y, currentIndex, shouldPrefetchOnly = false }) => {
    const groupRef = useRef<Konva.Group>(null);
    const { runtime } = usePlatform();

    // Tier 0: Thumbnail
    const [thumbImage] = useImage(page.thumbnailUrl);

    // Tier 1: High-res
    const [highResCanvas, setHighResCanvas] = React.useState<HTMLCanvasElement | null>(null);
    const [isRenderingHighRes, setIsRenderingHighRes] = React.useState(false);

    const documents = useStudioStore((s: StudioState) => s.documents);
    const gridColumns = useStudioStore((s: StudioState) => s.gridColumns);
    const studioViewScale = useStudioStore((s: StudioState) => s.studioViewScale);
    const detachPage = useStudioStore((s: StudioState) => s.detachPage);
    const selection = useStudioStore((s: StudioState) => s.selection);
    const setSelection = useStudioStore((s: StudioState) => s.setSelection);
    const setActiveDocument = useStudioStore((s: StudioState) => s.setActiveDocument);
    const isSelected = selection.some((s: SelectionItem) => s.pageId === page.id);

    const movePage = useStudioStore((s: StudioState) => s.movePage);
    const highResRenderScale = React.useMemo(() => {
        if (shouldPrefetchOnly) {
            return 2;
        }
        if (isSelected) {
            return studioViewScale >= 1.35 ? 3 : 2.5;
        }
        return studioViewScale >= 1.35 ? 3 : 2;
    }, [isSelected, shouldPrefetchOnly, studioViewScale]);

    const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        e.cancelBubble = true;
    };

    const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
        e.cancelBubble = true; // Don't drag the document
        const node = e.target;
        node.moveToTop(); // Bring to front
    };

    const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
        e.cancelBubble = true; // Prevent document from dragging when page is dragged
        const node = e.target;
        const stage = node.getStage();
        if (!stage) return;
        const pos = stage.getPointerPosition();

        if (!pos) return;
        const inverseTransform = stage.getAbsoluteTransform().copy().invert();
        const worldPos = inverseTransform.point(pos);

        let targetDocId: string | null = null;
        let targetDocNode: Konva.Group | null = null;

        const CARD_WIDTH = 200;
        const CARD_HEIGHT = 280;
        const GAP_X = 20;
        const GAP_Y = 30;
        const STEP_X = CARD_WIDTH + GAP_X;
        const STEP_Y = CARD_HEIGHT + GAP_Y;

        const stageScale = stage.scaleX() || 1;
        const absPos = node.absolutePosition();
        const centerPos = {
            x: absPos.x + 100 * stageScale,
            y: absPos.y + 140 * stageScale
        };

        const documentNodes = stage.find('.document');
        for (const node of documentNodes) {
            const dId = node.id();
            const docItem = documents.find(d => d.id === dId);
            if (!docItem) continue;

            const transform = node.getAbsoluteTransform().copy().invert();
            const localPos = transform.point(centerPos);

            const cols = Math.min(docItem.pages.length || 1, gridColumns);
            const rows = Math.ceil(docItem.pages.length / cols) || 1;
            const width = Math.max(STEP_X, cols * STEP_X);
            const height = Math.max(STEP_Y, rows * STEP_Y);

            if (localPos.x >= -30 && localPos.x <= width + 30 && localPos.y >= -50 && localPos.y <= height + 50) {
                targetDocId = dId;
                targetDocNode = node as Konva.Group;
                break;
            }
        }

        const sourceDoc = documents.find((doc) => doc.id === docId);

        let sourceDocWidth = STEP_X;
        let sourceDocHeight = STEP_Y;
        if (sourceDoc) {
            const cols = Math.min(sourceDoc.pages.length || 1, gridColumns);
            const rows = Math.ceil(sourceDoc.pages.length / cols) || 1;
            sourceDocWidth = Math.max(STEP_X, cols * STEP_X);
            sourceDocHeight = Math.max(STEP_Y, rows * STEP_Y);
        }

        const sourceMinX = (sourceDoc?.x ?? 0) - 30;
        const sourceMaxX = (sourceDoc?.x ?? 0) + sourceDocWidth + 30;
        const sourceMinY = (sourceDoc?.y ?? 0) - 50;
        const sourceMaxY = (sourceDoc?.y ?? 0) + sourceDocHeight + 50;

        const droppedOutsideSourceDoc =
            !sourceDoc
            || worldPos.x < sourceMinX
            || worldPos.x > sourceMaxX
            || worldPos.y < sourceMinY
            || worldPos.y > sourceMaxY;

        if (targetDocId && targetDocNode && !(targetDocId === docId && droppedOutsideSourceDoc)) {

            // Get local position relative to the target document
            const transform = targetDocNode.getAbsoluteTransform().copy().invert();
            const localPos = transform.point(centerPos);

            // Calculate col and row index based on local X and Y position in the grid
            const targetCol = Math.max(0, Math.min(gridColumns - 1, Math.round(localPos.x / STEP_X)));
            const targetRow = Math.max(0, Math.round(localPos.y / STEP_Y));

            // Calculate final 1D index
            const targetIndex = targetRow * gridColumns + targetCol;

            movePage(docId, page.id, targetDocId, targetIndex);
        } else {
            const absPos = node.absolutePosition();
            const worldDropPos = inverseTransform.point(absPos);
            detachPage(docId, page.id, worldDropPos.x, worldDropPos.y);
        }
    };

    const handleClick = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        setActiveDocument(docId);
        const currentSelection = useStudioStore.getState().selection;
        const isToggleSelect = e.evt.shiftKey || e.evt.altKey || e.evt.getModifierState?.('Alt');
        const isCurrentlySelected = currentSelection.some((item) => item.pageId === page.id);
        if (isToggleSelect) {
            setSelection(isCurrentlySelected
                ? currentSelection.filter((item) => item.pageId !== page.id)
                : [...currentSelection, { docId, pageId: page.id }]);
        } else {
            setSelection([{ docId, pageId: page.id }]);
        }
    };

    // Trigger High-Res render when component mounts (it only mounts when visible due to culling)
    React.useEffect(() => {
        let isMounted = true;
        const cacheKey = `${page.fileId}_${page.pageIndex}_${highResRenderScale}`;

        const existingCanvas = getCachedHighRes(cacheKey);
        if (existingCanvas) {
            setHighResCanvas(existingCanvas);
            return;
        }

        const renderHighRes = async () => {
            if (isRenderingHighRes) return;
            setIsRenderingHighRes(true);

            try {
                const pdfjs = await getPdfJs();
                // Read from VFS
                const entry = await runtime.vfs.read(page.fileId);
                const blob = await entry.getBlob();
                const buffer = await blob.arrayBuffer();

                // Get PDF Document
                const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
                const pdf = await loadingTask.promise;

                if (!isMounted) {
                    await pdf.destroy();
                    return;
                }

                const pdfPage = await pdf.getPage(page.pageIndex + 1);

                const viewport = pdfPage.getViewport({ scale: highResRenderScale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) throw new Error("Could not get 2d context for high-res render");

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                    canvas: canvas
                };

                await pdfPage.render(renderContext).promise;

                if (isMounted) {
                    setCachedHighRes(cacheKey, canvas);
                    setHighResCanvas(canvas);
                }

                await pdf.destroy();
            } catch (error) {
                console.error("Failed to render high-res page:", error);
            } finally {
                if (isMounted) setIsRenderingHighRes(false);
            }
        };

        // Delay render slightly to prioritize scrolling/panning smoothness over immediate high-res
        const timeoutId = setTimeout(() => {
            renderHighRes();
        }, 150);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [highResRenderScale, page.fileId, page.pageIndex, runtime.vfs]);

    // If this is just a prefetch mount, we don't return any Konva nodes
    // The useEffect above will still run and populate the LRU cache
    if (shouldPrefetchOnly) {
        return null;
    }

    const PAGE_WIDTH = 180;
    const PAGE_HEIGHT = 250;


    return (
        <Group
            ref={groupRef}
            id={page.id}
            name="page-object"
            x={x}
            y={y}
            draggable
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            rotation={page.rotation}
        >
            {/* Shadow/Glow for selection */}
            {isSelected && (
                <Rect
                    width={PAGE_WIDTH + 20}
                    height={PAGE_HEIGHT + 20}
                    x={-10}
                    y={-10}
                    fill="rgba(56, 189, 248, 0.42)"
                    stroke="rgba(125, 211, 252, 0.95)"
                    strokeWidth={3}
                    cornerRadius={12}
                    shadowColor="#38bdf8"
                    shadowBlur={24}
                    shadowOpacity={0.9}
                />
            )}

            {/* Page Content */}
            <Rect
                width={PAGE_WIDTH}
                height={PAGE_HEIGHT}
                fill="white"
                shadowBlur={10}
                shadowOpacity={0.3}
                cornerRadius={4}
            />

            {/* Render Image (HighRes prioritised, fallback to Thumb) */}
            {(highResCanvas || thumbImage) && (() => {
                const activeImage = highResCanvas || thumbImage;
                if (!activeImage) return null;

                const imgRatio = activeImage.width / activeImage.height;
                const boxRatio = PAGE_WIDTH / PAGE_HEIGHT;
                let drawWidth = PAGE_WIDTH;
                let drawHeight = PAGE_HEIGHT;
                let offsetX = 0;
                let offsetY = 0;

                if (imgRatio > boxRatio) {
                    drawWidth = PAGE_WIDTH;
                    drawHeight = PAGE_WIDTH / imgRatio;
                    offsetY = (PAGE_HEIGHT - drawHeight) / 2;
                } else {
                    drawHeight = PAGE_HEIGHT;
                    drawWidth = PAGE_HEIGHT * imgRatio;
                    offsetX = (PAGE_WIDTH - drawWidth) / 2;
                }

                return (
                    <Image
                        image={activeImage}
                        width={drawWidth}
                        height={drawHeight}
                        x={offsetX}
                        y={offsetY}
                        // Use ImageSmoothing for the low-res thumb to make it look less pixelated
                        // If we have high-res, we can disable it or keep it true for downscaling
                        imageSmoothingEnabled={!highResCanvas}
                        cornerRadius={4}
                    />
                );
            })()}

            {/* Page Number Badge */}
            <Group x={PAGE_WIDTH - 24} y={PAGE_HEIGHT - 24}>
                <Rect width={20} height={20} fill="rgba(0,0,0,0.6)" cornerRadius={4} />
                <Text
                    text={`${currentIndex + 1}`}
                    fill="white"
                    fontSize={10}
                    x={5}
                    y={5}
                    align="center"
                />
            </Group>

            {/* Interactions Overlay */}
            <Rect
                width={PAGE_WIDTH}
                height={PAGE_HEIGHT}
                fill="transparent"
                stroke={isSelected ? "#7dd3fc" : "transparent"}
                strokeWidth={isSelected ? 3 : 2}
                cornerRadius={4}
            />
        </Group>
    );
};
