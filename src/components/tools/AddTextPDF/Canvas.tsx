import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { TextElement } from '@/types/addText';

// Set worker path
// Worker configured in pdfService.ts

interface CanvasState {
  scale: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
}

interface CanvasProps {
  pdfFile: File | null;
  currentPage: number;
  textElements: TextElement[];
  selectedElementId: string | null;
  scale: number;
  onCanvasClick: (x: number, y: number) => void;
  onElementSelect: (id: string) => void;
  onElementMove: (id: string, x: number, y: number) => void;
  onPageChange?: (page: number) => void;
  onTotalPagesChange: (total: number) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  pdfFile,
  currentPage,
  textElements,
  selectedElementId,
  scale,
  onCanvasClick,
  onElementSelect,
  onElementMove,
  onTotalPagesChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const isRenderingRef = useRef(false);

  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0
  });
  const [draggedElement, setDraggedElement] = useState<string | null>(null);

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

      if (currentPage <= pdf.numPages) {
        await renderPage(pdf, currentPage);
      }
    } catch (error: unknown) {
      console.error('Error loading PDF:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, onTotalPagesChange]);

  // Helper function to render multiline text
  const renderMultilineText = useCallback((
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    lineHeight?: number
  ) => {
    const lines = text.split('\n');
    const actualLineHeight = lineHeight || fontSize * 1.2;

    lines.forEach((line, index) => {
      const lineY = y + (index * actualLineHeight);
      context.fillText(line, x, lineY);
    });

    return lines.length * actualLineHeight;
  }, []);

  // Get text bounds for multiline text
  const getMultilineTextBounds = useCallback((
    context: CanvasRenderingContext2D,
    text: string,
    fontSize: number,
    lineHeight?: number
  ) => {
    const lines = text.split('\n');
    const actualLineHeight = lineHeight || fontSize * 1.2;

    let maxWidth = 0;
    lines.forEach(line => {
      const metrics = context.measureText(line);
      maxWidth = Math.max(maxWidth, metrics.width);
    });

    return {
      width: maxWidth,
      height: lines.length * actualLineHeight,
      lineCount: lines.length
    };
  }, []);

  // Render PDF page
  const renderPage = useCallback(async (pdf: any, pageNumber: number) => {
    if (!pdf || !canvasRef.current) return;

    // Cancel any existing render task
    if (renderTaskRef.current) {
      try {
        await renderTaskRef.current.cancel();
      } catch (e: unknown) {
        // Task might already be completed or cancelled
      }
      renderTaskRef.current = null;
    }

    // Wait for any ongoing rendering to complete
    if (isRenderingRef.current) {
      return;
    }

    isRenderingRef.current = true;

    try {
      const page = await pdf.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        isRenderingRef.current = false;
        return;
      }

      const viewport = page.getViewport({ scale: scale * canvasState.scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      context.clearRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null;

      renderTextElements(context);

    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', error);
      }
    } finally {
      isRenderingRef.current = false;
    }
  }, [scale, canvasState.scale, currentPageElements, selectedElementId]);

  // Render text elements overlay
  const renderTextElements = useCallback((context: CanvasRenderingContext2D) => {
    currentPageElements.forEach(element => {
      context.save();

      context.font = `${element.fontSize * scale}px ${element.fontFamily}`;
      context.fillStyle = element.color;
      context.textBaseline = 'top';

      const bounds = getMultilineTextBounds(
        context,
        element.text,
        element.fontSize * scale
      );

      if (element.id === selectedElementId) {
        context.strokeStyle = '#007bff';
        context.lineWidth = 2;
        context.setLineDash([5, 5]);

        context.strokeRect(
          element.x * scale - 2,
          element.y * scale - 2,
          bounds.width + 4,
          bounds.height + 4
        );
      }

      renderMultilineText(
        context,
        element.text,
        element.x * scale,
        element.y * scale,
        element.fontSize * scale
      );

      context.restore();
    });
  }, [currentPageElements, selectedElementId, scale, renderMultilineText, getMultilineTextBounds]);

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    const clickedElement = currentPageElements.find(element => {
      const canvas2d = canvas.getContext('2d');
      if (!canvas2d) return false;

      canvas2d.font = `${element.fontSize * scale}px ${element.fontFamily}`;
      const bounds = getMultilineTextBounds(
        canvas2d,
        element.text,
        element.fontSize * scale
      );

      return (
        x >= element.x &&
        x <= element.x + (bounds.width / scale) &&
        y >= element.y &&
        y <= element.y + (bounds.height / scale)
      );
    });

    if (clickedElement) {
      onElementSelect(clickedElement.id);
    } else {
      onCanvasClick(x, y);
    }
  }, [currentPageElements, scale, onElementSelect, onCanvasClick, getMultilineTextBounds]);

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedElementId) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    const selectedElement = currentPageElements.find(el => el.id === selectedElementId);
    if (selectedElement) {
      setDraggedElement(selectedElementId);
      setCanvasState(prev => ({
        ...prev,
        isDragging: true,
        dragStartX: x - selectedElement.x,
        dragStartY: y - selectedElement.y
      }));
    }
  }, [selectedElementId, currentPageElements, scale]);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasState.isDragging || !draggedElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    const newX = x - canvasState.dragStartX;
    const newY = y - canvasState.dragStartY;

    onElementMove(draggedElement, Math.max(0, newX), Math.max(0, newY));
  }, [canvasState.isDragging, canvasState.dragStartX, canvasState.dragStartY, draggedElement, scale, onElementMove]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setCanvasState(prev => ({ ...prev, isDragging: false }));
    setDraggedElement(null);
  }, []);

  // Load PDF when file changes
  useEffect(() => {
    if (pdfFile) {
      loadPDF(pdfFile);
    }
  }, [pdfFile, loadPDF]);

  // Re-render when page or elements change
  useEffect(() => {
    if (!pdfDocument) return;

    const timeoutId = setTimeout(() => {
      renderPage(pdfDocument, currentPage);
    }, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pdfDocument, currentPage, currentPageElements, selectedElementId, scale, renderPage]);

  // Cleanup render task on unmount
  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e: unknown) {
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
      className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-auto h-full"
      style={{
        width: '100%',
        overflowX: 'auto',
        overflowY: 'auto'
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-gray-900/75 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading PDF...</p>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="cursor-crosshair"
        style={{
          display: 'block',
          margin: '20px auto',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          maxWidth: 'none'
        }}
      />
    </div>
  );
};
