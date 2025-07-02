import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { TextElement, CanvasState } from '../types';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface CanvasProps {
  pdfFile: File | null;
  currentPage: number;
  textElements: TextElement[];
  selectedElementId: string | null;
  scale: number;
  onCanvasClick: (x: number, y: number) => void;
  onElementSelect: (id: string) => void;
  onElementMove: (id: string, x: number, y: number) => void;
  onPageChange: (page: number) => void;
  onTotalPagesChange: (total: number) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  pdfFile,
  currentPage,
  textElements,
  selectedElementId,
  scale,
  onCanvasClick,
  onElementSelect,
  onElementMove,
  onPageChange,
  onTotalPagesChange
}) => {
  // Refs - CRITICAL FIX for canvas rendering race condition
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);

  // State
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

  // Load PDF document
  const loadPDF = useCallback(async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      setPdfDocument(pdf);
      onTotalPagesChange(pdf.numPages);
      
      // Render first page
      if (currentPage <= pdf.numPages) {
        await renderPage(pdf, currentPage);
      }
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, onTotalPagesChange]);

  // Render PDF page with race condition fix
  const renderPage = useCallback(async (pdf: any, pageNumber: number) => {
    if (!pdf || !canvasRef.current) return;

    // Cancel previous render task - CRITICAL FIX
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (e) {
        // Task might already be completed
      }
    }

    try {
      const page = await pdf.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      // Calculate viewport
      const viewport = page.getViewport({ scale: scale * canvasState.scale });
      
      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Render PDF page
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;

      // Render text elements on top
      renderTextElements(context, viewport);

    } catch (error) {
      if (error.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', error);
      }
    }
  }, [scale, canvasState.scale, textElements, selectedElementId]);

  // Render text elements overlay
  const renderTextElements = useCallback((context: CanvasRenderingContext2D, viewport: any) => {
    textElements
      .filter(element => element.pageNumber === currentPage)
      .forEach(element => {
        context.save();
        
        // Set text properties
        context.font = `${element.fontSize * scale}px ${element.fontFamily}`;
        context.fillStyle = element.color;
        context.textBaseline = 'top';

        // Highlight selected element
        if (element.id === selectedElementId) {
          context.strokeStyle = '#007bff';
          context.lineWidth = 2;
          context.setLineDash([5, 5]);
          
          const textWidth = context.measureText(element.text).width;
          const textHeight = element.fontSize * scale;
          
          context.strokeRect(
            element.x * scale - 2,
            element.y * scale - 2,
            textWidth + 4,
            textHeight + 4
          );
        }

        // Draw text
        context.fillText(
          element.text,
          element.x * scale,
          element.y * scale
        );

        context.restore();
      });
  }, [textElements, currentPage, selectedElementId, scale]);

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    // Check if clicked on existing text element
    const clickedElement = textElements.find(element => {
      if (element.pageNumber !== currentPage) return false;
      
      const canvas2d = canvas.getContext('2d');
      if (!canvas2d) return false;
      
      canvas2d.font = `${element.fontSize * scale}px ${element.fontFamily}`;
      const textWidth = canvas2d.measureText(element.text).width / scale;
      const textHeight = element.fontSize;
      
      return (
        x >= element.x &&
        x <= element.x + textWidth &&
        y >= element.y &&
        y <= element.y + textHeight
      );
    });

    if (clickedElement) {
      onElementSelect(clickedElement.id);
    } else {
      onCanvasClick(x, y);
    }
  }, [textElements, currentPage, scale, onElementSelect, onCanvasClick]);

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedElementId) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    const selectedElement = textElements.find(el => el.id === selectedElementId);
    if (selectedElement) {
      setDraggedElement(selectedElementId);
      setCanvasState(prev => ({
        ...prev,
        isDragging: true,
        dragStartX: x - selectedElement.x,
        dragStartY: y - selectedElement.y
      }));
    }
  }, [selectedElementId, textElements, scale]);

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
    if (pdfDocument) {
      renderPage(pdfDocument, currentPage);
    }
  }, [pdfDocument, currentPage, textElements, selectedElementId, scale, renderPage]);

  // Cleanup render task on unmount
  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // Task might already be completed
        }
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative bg-gray-100 border rounded-lg overflow-auto"
      style={{ 
        height: '600px',
        width: '100%',
        // Enhanced scrolling - CRITICAL FIX
        overflowX: 'auto',
        overflowY: 'auto'
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading PDF...</p>
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
          maxWidth: 'none' // Allow horizontal scrolling
        }}
      />
    </div>
  );
};

export default Canvas;