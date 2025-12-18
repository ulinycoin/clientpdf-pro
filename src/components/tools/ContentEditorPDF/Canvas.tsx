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
    onSmartDetect?: (x: number, y: number) => void;
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
    } | null>(null);

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: string) => {
        e.stopPropagation();
        onElementSelect(id);
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

        // Constraints
        newCenterX = Math.max(info.elementHalfW, Math.min(100 - info.elementHalfW, newCenterX));
        newCenterY = Math.max(info.elementHalfH, Math.min(100 - info.elementHalfH, newCenterY));

        onElementMove(draggedElement, newCenterX, newCenterY);

        info.startX = clientX;
        info.startY = clientY;
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setDraggedElement(null);
        dragInfoRef.current = null;
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        if (isDragging) return;

        if (imageRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
            const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
            const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

            if (xPercent >= 0 && xPercent <= 100 && yPercent >= 0 && yPercent <= 100) {
                if (toolMode === 'edit' && onSmartDetect) {
                    onSmartDetect(xPercent, yPercent);
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

                {isRendering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50">
                        <Loader2 className="w-8 h-8 animate-spin text-ocean-500" />
                    </div>
                )}

                {/* Text Elements Overlay */}
                {currentPageElements.map(element => (
                    <div
                        key={element.id}
                        id={`text-el-${element.id}`}
                        onMouseDown={(e) => handleDragStart(e, element.id)}
                        onTouchStart={(e) => handleDragStart(e, element.id)}
                        className={`absolute flex items-center ${element.textAlign === 'left' ? 'justify-start' : element.textAlign === 'right' ? 'justify-end' : 'justify-center'} cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-ocean-500/50 rounded transition-shadow ${selectedElementId === element.id ? 'ring-2 ring-ocean-500 shadow-lg z-10' : 'z-0'
                            }`}
                        style={{
                            left: `${element.x}%`,
                            top: `${element.y}%`,
                            transform: `translate(-50%, -50%) rotate(${element.rotation}deg) scaleX(${element.horizontalScaling || 1.0})`,
                            color: element.color,
                            opacity: element.opacity / 100,
                            fontSize: `${element.fontSize * (pdfDimensions.width / 595)}px`, // Simplified scale
                            fontFamily: element.fontFamily,
                            fontWeight: element.bold ? 'bold' : 'normal',
                            fontStyle: element.italic ? 'italic' : 'normal',
                            textAlign: element.textAlign || 'left',
                            whiteSpace: 'pre',
                            minWidth: 'max-content',
                            pointerEvents: isDragging && draggedElement !== element.id ? 'none' : 'auto',
                            userSelect: 'none',
                            backgroundColor: element.id === selectedElementId ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                        }}
                    >
                        {element.text || ' '}

                        {/* Visual guide for original line width */}
                        {element.id === selectedElementId && element.originalRect && (
                            <div
                                className="absolute pointer-events-none border-2 border-dashed border-ocean-400/50 rounded-sm"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: `${(element.originalRect.w / 100) * pdfDimensions.width}px`,
                                    height: '120%',
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
