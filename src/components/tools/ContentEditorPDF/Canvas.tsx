/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { TextElement } from '@/types/contentEditor';
import { Loader2 } from 'lucide-react';

interface CanvasProps {
    pdfFile: File | null;
    currentPage: number;
    textElements: TextElement[];
    selectedElementId: string | null;
    toolMode: 'select' | 'add' | 'edit';
    onCanvasClick: (x: number, y: number) => void;
    onElementSelect: (id: string | null) => void;
    onElementMove: (id: string, x: number, y: number) => void;
    onTotalPagesChange: (total: number) => void;
    onSmartDetect?: (x: number, y: number, color?: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
    pdfFile,
    currentPage,
    textElements,
    selectedElementId,
    toolMode,
    onCanvasClick,
    onElementSelect,
    onElementMove,
    onTotalPagesChange,
    onSmartDetect
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
    const [pdfPointDimensions, setPdfPointDimensions] = useState({ width: 0, height: 0 });
    const [previewScale] = useState(1.5);
    const [isRendering, setIsRendering] = useState(false);

    const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
    const isRenderingRef = useRef(false);

    // Load PDF
    const loadPDF = useCallback(async (file: File) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            setPdfDocument(pdf);
            onTotalPagesChange(pdf.numPages);
        } catch (error) {
            console.error('Error loading PDF:', error);
        }
    }, [onTotalPagesChange]);

    // Render Page
    const renderPage = useCallback(async (pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number) => {
        if (isRenderingRef.current || !canvasRef.current) return;

        isRenderingRef.current = true;
        setIsRendering(true);

        try {
            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: previewScale });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (!context) return;

            canvas.width = viewport.width;
            canvas.height = viewport.height;
            setPdfDimensions({ width: viewport.width, height: viewport.height });

            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }

            renderTaskRef.current = page.render({
                canvasContext: context,
                viewport,
                canvas: canvasRef.current!
            });

            await renderTaskRef.current.promise;
            renderTaskRef.current = null;

            // Real PDF points for precision scaling
            const pointsViewport = page.getViewport({ scale: 1.0 });
            setPdfPointDimensions({ width: pointsViewport.width, height: pointsViewport.height });

            // Extract text bounds for snapping
            const textContent = await page.getTextContent();
            const pageViewport = page.getViewport({ scale: 1.0 });
            const bounds = textContent.items.map((item: any) => {
                if (!('str' in item)) return null;
                const transform = item.transform;
                const fontSize = Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]);
                const itemX = transform[4];
                const itemY = pageViewport.height - transform[5] - (item.height || fontSize);
                const itemW = item.width || (item.str.length * fontSize * 0.5);
                const itemH = item.height || fontSize;
                return {
                    x: (itemX / pageViewport.width) * 100,
                    y: (itemY / pageViewport.height) * 100,
                    w: (itemW / pageViewport.width) * 100,
                    h: (itemH / pageViewport.height) * 100
                };
            }).filter(Boolean);
            setOriginalTextBounds(bounds as any);
        } catch (error) {
            console.error('Error rendering page:', error);
        } finally {
            isRenderingRef.current = false;
            setIsRendering(false);
        }
    }, [previewScale]);

    // Handle Dragging
    const [isDragging, setIsDragging] = useState(false);
    const [draggedElement, setDraggedElement] = useState<string | null>(null);
    const dragInfoRef = useRef<{
        startX: number;
        startY: number;
        containerWidth: number;
        containerHeight: number;
        elementHalfW: number;
        elementHalfH: number;
        others: Array<{
            id: string;
            x: number;
            y: number;
            halfW: number;
            halfH: number;
        }>;
    } | null>(null);

    const [activeSnaps, setActiveSnaps] = useState<{ x: number[], y: number[] }>({ x: [], y: [] });
    const [originalTextBounds, setOriginalTextBounds] = useState<{ x: number, y: number, w: number, h: number }[]>([]);

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: string) => {
        e.stopPropagation();
        onElementSelect(id);

        const element = textElements.find(el => el.id === id);
        if (element?.originalRect) return; // Sticky position: disable dragging
        setIsDragging(true);
        setDraggedElement(id);

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        if (imageRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
            const el = document.getElementById(`text-el-${id}`);
            const elRect = el?.getBoundingClientRect() || { width: 0, height: 0 };

            dragInfoRef.current = {
                startX: clientX,
                startY: clientY,
                containerWidth: rect.width,
                containerHeight: rect.height,
                elementHalfW: (elRect.width / 2 / rect.width) * 100,
                elementHalfH: (elRect.height / 2 / rect.height) * 100,
                others: textElements
                    .filter(el => el.id !== id && el.pageNumber === currentPage)
                    .map(el => {
                        const node = document.getElementById(`text-el-${el.id}`);
                        if (!node) return null;
                        const nodeRect = node.getBoundingClientRect();
                        return {
                            id: el.id,
                            x: el.x,
                            y: el.y,
                            halfW: (nodeRect.width / 2 / rect.width) * 100,
                            halfH: (nodeRect.height / 2 / rect.height) * 100
                        };
                    })
                    .filter((item): item is NonNullable<typeof item> => item !== null)
            };
        }
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !draggedElement || !dragInfoRef.current) return;

        const info = dragInfoRef.current;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const dx = ((clientX - info.startX) / info.containerWidth) * 100;
        const dy = ((clientY - info.startY) / info.containerHeight) * 100;

        const element = textElements.find(el => el.id === draggedElement);
        if (!element) return;

        let newCenterX = element.x + dx;
        let newCenterY = element.y + dy;

        // Snapping logic
        const snapThreshold = 1.0; // % threshold
        const snapsX = new Set<number>();
        const snapsY = new Set<number>();

        const pageSnapsX = [0, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100];
        const pageSnapsY = [0, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100];

        const halfW = info.elementHalfW;
        const halfH = info.elementHalfH;

        // Snap to Page Boundaries/Center
        pageSnapsX.forEach(px => {
            if (Math.abs((newCenterX - halfW) - px) < snapThreshold) {
                newCenterX = px + halfW;
                snapsX.add(px);
            } else if (Math.abs(newCenterX - px) < snapThreshold) {
                newCenterX = px;
                snapsX.add(px);
            } else if (Math.abs((newCenterX + halfW) - px) < snapThreshold) {
                newCenterX = px - halfW;
                snapsX.add(px);
            }
        });

        pageSnapsY.forEach(py => {
            if (Math.abs((newCenterY - halfH) - py) < snapThreshold) {
                newCenterY = py + halfH;
                snapsY.add(py);
            } else if (Math.abs(newCenterY - py) < snapThreshold) {
                newCenterY = py;
                snapsY.add(py);
            } else if (Math.abs((newCenterY + halfH) - py) < snapThreshold) {
                newCenterY = py - halfH;
                snapsY.add(py);
            }
        });

        // Snap to other elements (Edge to Edge / Edge to Center)
        info.others.forEach(other => {
            const currentEdgesX = [];
            if (element.textAlign === 'left') {
                currentEdgesX.push(newCenterX, newCenterX + halfW * 2); // left, right
            } else if (element.textAlign === 'right') {
                currentEdgesX.push(newCenterX - halfW * 2, newCenterX); // left, right
            } else {
                currentEdgesX.push(newCenterX - halfW, newCenterX, newCenterX + halfW); // left, center, right
            }

            const otherEdgesX = [other.x - other.halfW, other.x, other.x + other.halfW];

            currentEdgesX.forEach((curEdge, curIdx) => {
                otherEdgesX.forEach(othEdge => {
                    if (Math.abs(curEdge - othEdge) < snapThreshold) {
                        if (element.textAlign === 'left') {
                            newCenterX = curIdx === 0 ? othEdge : othEdge - halfW * 2;
                        } else if (element.textAlign === 'right') {
                            newCenterX = curIdx === 1 ? othEdge : othEdge + halfW * 2;
                        } else {
                            if (curIdx === 0) newCenterX = othEdge + halfW;
                            else if (curIdx === 1) newCenterX = othEdge;
                            else if (curIdx === 2) newCenterX = othEdge - halfW;
                        }
                        snapsX.add(othEdge);
                    }
                });
            });

            // Y snapping (Center to Center)
            if (Math.abs(newCenterY - other.y) < snapThreshold) {
                newCenterY = other.y;
                snapsY.add(other.y);
            }
        });

        // Snap to original text lines (Horizontal Anchor & Vertical Baseline)
        originalTextBounds.forEach(bound => {
            // Horizontal Snap (Left anchor to Left edge)
            const leftX = bound.x;
            const rightX = bound.x + bound.w;
            const centerX = bound.x + bound.w / 2;

            if (element.textAlign === 'left' && Math.abs(newCenterX - leftX) < snapThreshold) {
                newCenterX = leftX;
                snapsX.add(leftX);
            } else if (element.textAlign === 'right' && Math.abs(newCenterX - rightX) < snapThreshold) {
                newCenterX = rightX;
                snapsX.add(rightX);
            } else if (element.textAlign === 'center' && Math.abs(newCenterX - centerX) < snapThreshold) {
                newCenterX = centerX;
                snapsX.add(centerX);
            }

            // Vertical Snap (Center anchor to Baseline area)
            // Original text Y in PDF is baseline, but our detect uses bounding box top
            // Center is usually close to baseline + 0.3 * height
            const baselineY = bound.y + bound.h;
            if (Math.abs(newCenterY - baselineY) < snapThreshold) {
                newCenterY = baselineY;
                snapsY.add(baselineY);
            }
        });

        setActiveSnaps({ x: Array.from(snapsX), y: Array.from(snapsY) });

        // Constraints
        onElementMove(draggedElement, newCenterX, newCenterY);

        info.startX = clientX;
        info.startY = clientY;
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setDraggedElement(null);
        dragInfoRef.current = null;
        setActiveSnaps({ x: [], y: [] });
    };

    const rgbToHex = (r: number, g: number, b: number) => {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        if (isDragging) return;

        if (imageRef.current && canvasRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
            const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
            const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

            if (xPercent >= 0 && xPercent <= 100 && yPercent >= 0 && yPercent <= 100) {
                if (toolMode === 'edit' && onSmartDetect) {
                    // Smart Pipette 2.0: Sample an area around the click to find the most significant color
                    let detectedColor = '#000000';
                    try {
                        const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
                        if (ctx) {
                            const canvasX = Math.round((xPercent / 100) * canvasRef.current.width);
                            const canvasY = Math.round((yPercent / 100) * canvasRef.current.height);

                            // Sample 7x7 area
                            const areaSize = 3; // radius
                            const imageData = ctx.getImageData(canvasX - areaSize, canvasY - areaSize, areaSize * 2 + 1, areaSize * 2 + 1);
                            const pixels = imageData.data;

                            let bestPixel = { r: 0, g: 0, b: 0, score: -1 };

                            for (let i = 0; i < pixels.length; i += 4) {
                                const r = pixels[i];
                                const g = pixels[i + 1];
                                const b = pixels[i + 2];
                                const a = pixels[i + 3];

                                if (a < 128) continue; // Skip semi-transparent

                                // Score: we want the "least white" pixel (darkest/most saturated)
                                // In many PDFs text is dark on white.
                                // Distance from white (255, 255, 255)
                                const distFromWhite = Math.sqrt(
                                    Math.pow(255 - r, 2) + Math.pow(255 - g, 2) + Math.pow(255 - b, 2)
                                );

                                if (distFromWhite > bestPixel.score) {
                                    bestPixel = { r, g, b, score: distFromWhite };
                                }
                            }

                            if (bestPixel.score > 10) { // If we found something reasonably non-white
                                detectedColor = rgbToHex(bestPixel.r, bestPixel.g, bestPixel.b);
                            }
                        }
                    } catch (err) {
                        console.error('Error sampling color:', err);
                    }
                    onSmartDetect(xPercent, yPercent, detectedColor);
                } else {
                    onCanvasClick(xPercent, yPercent);
                }
            } else {
                onElementSelect(null);
            }
        }
    };

    // Effects
    useEffect(() => {
        if (pdfFile) loadPDF(pdfFile);
    }, [pdfFile, loadPDF]);

    useEffect(() => {
        if (pdfDocument) renderPage(pdfDocument, currentPage);
    }, [pdfDocument, currentPage, renderPage]);

    const currentPageElements = textElements.filter(el => el.pageNumber === currentPage);

    return (
        <div
            className="relative w-full h-full flex items-center justify-center p-8 bg-dots-light dark:bg-dots-dark overflow-auto"
            onClick={handleContainerClick}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
        >
            <div
                ref={imageRef}
                className="relative shadow-2xl rounded-sm bg-white"
                style={{
                    width: pdfDimensions.width ? 'auto' : '100%',
                    maxWidth: '100%',
                    aspectRatio: pdfDimensions.width ? `${pdfDimensions.width}/${pdfDimensions.height}` : 'auto'
                }}
            >
                <canvas ref={canvasRef} className="max-w-full h-auto block" />

                {/* Snap Lines */}
                {activeSnaps.x.map((x, i) => (
                    <div
                        key={`snap-x-${i}`}
                        className="absolute top-0 bottom-0 border-l border-dashed border-ocean-500 z-50 pointer-events-none"
                        style={{ left: `${x}%` }}
                    />
                ))}
                {activeSnaps.y.map((y, i) => (
                    <div
                        key={`snap-y-${i}`}
                        className="absolute left-0 right-0 border-t border-dashed border-ocean-500 z-50 pointer-events-none"
                        style={{ top: `${y}%` }}
                    />
                ))}

                {isRendering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50">
                        <Loader2 className="w-8 h-8 animate-spin text-ocean-500" />
                    </div>
                )}

                {/* Masking Layer (Hides original text in preview) */}
                {currentPageElements.map(element => (
                    element.originalRect && (
                        <div
                            key={`mask-${element.id}`}
                            className="absolute pointer-events-none z-0"
                            style={{
                                left: `${element.originalRect.x}%`,
                                top: `${element.originalRect.y}%`,
                                width: `${element.originalRect.w}%`,
                                height: `${element.originalRect.h}%`,
                                backgroundColor: element.backgroundColor || '#FFFFFF',
                            }}
                        />
                    )
                ))}

                {/* Text Elements Overlay */}
                {currentPageElements.map(element => (
                    <div
                        key={element.id}
                        id={`text-el-${element.id}`}
                        onMouseDown={(e) => handleDragStart(e, element.id)}
                        onTouchStart={(e) => handleDragStart(e, element.id)}
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute flex items-center ${element.textAlign === 'left' ? 'justify-start' : element.textAlign === 'right' ? 'justify-end' : 'justify-center'} ${element.originalRect ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} hover:ring-2 hover:ring-ocean-500/50 rounded transition-shadow ${selectedElementId === element.id ? 'ring-2 ring-ocean-500 shadow-lg z-10' : 'z-0'
                            }`}
                        style={{
                            left: `${element.x}%`,
                            top: `${element.y}%`,
                            transform: `${element.textAlign === 'left' ? 'translate(0, -50%)' : element.textAlign === 'right' ? 'translate(-100%, -50%)' : 'translate(-50%, -50%)'} rotate(${element.rotation}deg) scaleX(${element.horizontalScaling || 1.0})`,
                            color: element.color,
                            opacity: element.opacity / 100,
                            fontSize: `${element.fontSize * (pdfDimensions.width / (pdfPointDimensions.width || 595))}px`,
                            fontFamily: element.fontFamily,
                            fontWeight: element.bold ? 'bold' : 'normal',
                            fontStyle: element.italic ? 'italic' : 'normal',
                            textAlign: element.textAlign || 'left',
                            whiteSpace: 'pre',
                            minWidth: 'max-content',
                            pointerEvents: isDragging && draggedElement !== element.id ? 'none' : 'auto',
                            userSelect: 'none',
                        }}
                    >
                        {element.text || ' '}
                    </div>
                ))}

                {/* Original Rect Overlay (Visual guide for original line width) */}
                {currentPageElements.map(element => (
                    element.id === selectedElementId && element.originalRect && (
                        <div
                            key={`original-rect-${element.id}`}
                            className="absolute pointer-events-none border-2 border-dashed border-ocean-400/50 rounded-sm z-0"
                            style={{
                                left: `${element.originalRect.x}%`,
                                top: `${element.originalRect.y}%`,
                                width: `${element.originalRect.w}%`,
                                height: `${element.originalRect.h}%`,
                            }}
                        />
                    )
                ))}
            </div>
        </div>
    );
};
