import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { TextElement } from '@/types/addText';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface CanvasProps {
  pdfFile: File | null;
  currentPage: number;
  textElements: TextElement[];
  selectedElementId: string | null;
  onCanvasClick: (x: number, y: number) => void;
  onElementSelect: (id: string) => void;
  onElementMove: (id: string, x: number, y: number) => void;
  onTotalPagesChange: (total: number) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  pdfFile,
  currentPage,
  textElements,
  selectedElementId,
  onCanvasClick,
  onElementSelect,
  onElementMove,
  onTotalPagesChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const isRenderingRef = useRef(false);

  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });

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

  // Filter text elements for current page only
  const currentPageElements = textElements.filter(el => el.pageNumber === currentPage);

  // Load PDF document
  const loadPDF = useCallback(async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      setPdfDocument(pdf);
      onTotalPagesChange(pdf.numPages);
    } catch (error: unknown) {
      console.error('Error loading PDF:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onTotalPagesChange]);

  const updateScale = useCallback(() => {
    if (canvasRef.current && imageRef.current && pdfDimensions.width > 0) {
      const displayedWidth = imageRef.current.clientWidth;
      setPreviewScale(displayedWidth / pdfDimensions.width);
    }
  }, [pdfDimensions]);

  // Render PDF page
  const renderPage = useCallback(async (pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number) => {
    if (!pdf || !canvasRef.current) return;

    if (renderTaskRef.current) {
      try {
        await renderTaskRef.current.cancel();
      } catch { /* ignore */ }
      renderTaskRef.current = null;
    }

    if (isRenderingRef.current) return;
    isRenderingRef.current = true;

    try {
      const page = await pdf.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        isRenderingRef.current = false;
        return;
      }

      const viewport = page.getViewport({ scale: 1.5 }); // Base scale for quality
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      setPdfDimensions({ width: viewport.width, height: viewport.height });

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      // @ts-expect-error - pdfjs types mismatch
      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null;

      updateScale();
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', error);
      }
    } finally {
      isRenderingRef.current = false;
    }
  }, [updateScale]);

  // Resize observer
  useEffect(() => {
    const observer = new ResizeObserver(updateScale);
    if (imageRef.current) observer.observe(imageRef.current);
    return () => observer.disconnect();
  }, [updateScale]);

  const [activeSnaps, setActiveSnaps] = useState<{ x: number[], y: number[] }>({ x: [], y: [] });

  // Passive Snap Detection (for Keyboard Nudging)
  useEffect(() => {
    if (isDragging || !selectedElementId || !imageRef.current) {
      if (!isDragging) setActiveSnaps({ x: [], y: [] });
      return;
    }

    const containerRect = imageRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    const element = textElements.find(el => el.id === selectedElementId);
    if (!element) return;

    const node = document.getElementById(`text-el-${selectedElementId}`);
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const halfW = (rect.width / containerWidth) * 50;
    const halfH = (rect.height / containerHeight) * 50;

    const snapThreshold = 1.0; // tighter for passive detection
    const snapsX = new Set<number>();
    const snapsY = new Set<number>();

    const pageSnapsX = [0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100];
    const pageSnapsY = [0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100];

    // Check center, left, right against page snaps
    const currentXPoints = [element.x, element.x - halfW, element.x + halfW];
    const currentYPoints = [element.y, element.y - halfH, element.y + halfH];

    pageSnapsX.forEach(px => {
      currentXPoints.forEach(curX => {
        if (Math.abs(curX - px) < snapThreshold) snapsX.add(px);
      });
    });
    pageSnapsY.forEach(py => {
      currentYPoints.forEach(curY => {
        if (Math.abs(curY - py) < snapThreshold) snapsY.add(py);
      });
    });

    // Element-to-element
    const otherElements = currentPageElements.filter(el => el.id !== selectedElementId);
    otherElements.forEach(other => {
      const otherNode = document.getElementById(`text-el-${other.id}`);
      if (!otherNode) return;
      const otherRect = otherNode.getBoundingClientRect();
      const oHalfW = (otherRect.width / containerWidth) * 50;
      const oHalfH = (otherRect.height / containerHeight) * 50;
      const otherEdgesX = [other.x, other.x - oHalfW, other.x + oHalfW];
      const otherEdgesY = [other.y, other.y - oHalfH, other.y + oHalfH];

      currentXPoints.forEach(curX => {
        otherEdgesX.forEach(othX => {
          if (Math.abs(curX - othX) < snapThreshold) snapsX.add(othX);
        });
      });
      currentYPoints.forEach(curY => {
        otherEdgesY.forEach(othY => {
          if (Math.abs(curY - othY) < snapThreshold) snapsY.add(othY);
        });
      });
    });

    setActiveSnaps({ x: Array.from(snapsX), y: Array.from(snapsY) });
  }, [selectedElementId, textElements, isDragging, currentPageElements]);

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.stopPropagation();
    if (!imageRef.current) return;

    onElementSelect(id);
    setIsDragging(true);
    setDraggedElement(id);

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const containerRect = imageRef.current.getBoundingClientRect();
    const dragNode = document.getElementById(`text-el-${id}`);
    if (!dragNode) return;
    const dragRect = dragNode.getBoundingClientRect();

    // Cache everything
    dragInfoRef.current = {
      startX: clientX,
      startY: clientY,
      containerWidth: containerRect.width,
      containerHeight: containerRect.height,
      elementHalfW: (dragRect.width / containerRect.width) * 50,
      elementHalfH: (dragRect.height / containerRect.height) * 50,
      others: currentPageElements
        .filter(el => el.id !== id)
        .map(el => {
          const node = document.getElementById(`text-el-${el.id}`);
          if (!node) return null;
          const rect = node.getBoundingClientRect();
          return {
            id: el.id,
            x: el.x,
            y: el.y,
            halfW: (rect.width / containerRect.width) * 50,
            halfH: (rect.height / containerRect.height) * 50
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
    };
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !draggedElement || !dragInfoRef.current || !imageRef.current) return;

    const info = dragInfoRef.current;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const deltaX = clientX - info.startX;
    const deltaY = clientY - info.startY;

    const element = textElements.find(el => el.id === draggedElement);
    if (!element) return;

    // Current tentative position (center)
    let newCenterX = element.x + (deltaX / info.containerWidth) * 100;
    let newCenterY = element.y + (deltaY / info.containerHeight) * 100;

    const halfW = info.elementHalfW;
    const halfH = info.elementHalfH;

    // Snap Points and Threshold
    const snapThreshold = 2.0;
    const snapsX = new Set<number>();
    const snapsY = new Set<number>();

    const pageSnapsX = [0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100];
    const pageSnapsY = [0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100];

    // Page Snaps
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

    // Element-to-Element Snaps
    info.others.forEach(other => {
      const otherEdgesX = [other.x, other.x - other.halfW, other.x + other.halfW];
      const otherEdgesY = [other.y, other.y - other.halfH, other.y + other.halfH];
      const currentEdgesX = [newCenterX, newCenterX - halfW, newCenterX + halfW];
      const currentEdgesY = [newCenterY, newCenterY - halfH, newCenterY + halfH];

      currentEdgesX.forEach((curEdge, curIdx) => {
        otherEdgesX.forEach(othEdge => {
          if (Math.abs(curEdge - othEdge) < snapThreshold) {
            if (curIdx === 0) newCenterX = othEdge;
            else if (curIdx === 1) newCenterX = othEdge + halfW;
            else if (curIdx === 2) newCenterX = othEdge - halfW;
            snapsX.add(othEdge);
          }
        });
      });

      currentEdgesY.forEach((curEdge, curIdx) => {
        otherEdgesY.forEach(othEdge => {
          if (Math.abs(curEdge - othEdge) < snapThreshold) {
            if (curIdx === 0) newCenterY = othEdge;
            else if (curIdx === 1) newCenterY = othEdge + halfH;
            else if (curIdx === 2) newCenterY = othEdge - halfH;
            snapsY.add(othEdge);
          }
        });
      });
    });

    setActiveSnaps({ x: Array.from(snapsX), y: Array.from(snapsY) });
    onElementMove(draggedElement, newCenterX, newCenterY);

    // Update start pos for next move to be relative to the move we just made
    info.startX = clientX;
    info.startY = clientY;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedElement(null);
    dragInfoRef.current = null;
    setActiveSnaps({ x: [], y: [] });
  };
  const handleContainerClick = (e: React.MouseEvent) => {
    if (isDragging) return;

    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

      if (xPercent >= 0 && xPercent <= 100 && yPercent >= 0 && yPercent <= 100) {
        onCanvasClick(xPercent, yPercent);
      } else {
        onElementSelect('');
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

  // Cleanup render task on unmount
  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Task might already be completed
        }
        renderTaskRef.current = null;
      }
      isRenderingRef.current = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
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

        {/* Smart Guides */}
        {activeSnaps.x.map((x: number, i: number) => (
          <div
            key={`snap-x-${i}`}
            className="absolute top-0 bottom-0 border-l border-dashed border-ocean-500 z-50 pointer-events-none"
            style={{ left: `${x}%` }}
          />
        ))}
        {activeSnaps.y.map((y: number, i: number) => (
          <div
            key={`snap-y-${i}`}
            className="absolute left-0 right-0 border-t border-dashed border-ocean-500 z-50 pointer-events-none"
            style={{ top: `${y}%` }}
          />
        ))}

        {currentPageElements.map(element => (
          <div
            key={element.id}
            id={`text-el-${element.id}`}
            onMouseDown={(e) => handleDragStart(e, element.id)}
            onTouchStart={(e) => handleDragStart(e, element.id)}
            className={`absolute flex items-center justify-center cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-ocean-500/50 rounded transition-shadow ${selectedElementId === element.id ? 'ring-2 ring-ocean-500 shadow-lg z-10' : 'z-0'
              }`}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
              color: element.color,
              opacity: element.opacity / 100,
              fontSize: `${element.fontSize * previewScale * 1.5}px`, // 1.5 because viewport scale was 1.5
              fontFamily: element.fontFamily,
              fontWeight: element.bold ? 'bold' : 'normal',
              fontStyle: element.italic ? 'italic' : 'normal',
              whiteSpace: 'pre',
              minWidth: 'max-content',
              pointerEvents: isDragging && draggedElement !== element.id ? 'none' : 'auto',
              userSelect: 'none'
            }}
          >
            {element.text || ' '}
          </div>
        ))}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-500" />
          </div>
        )}
      </div>
    </div>
  );
};
