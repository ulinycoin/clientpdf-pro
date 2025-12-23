import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { FormField } from '@/types/formFields';
import { Loader2 } from 'lucide-react';

interface CanvasProps {
  pdfDocument: pdfjsLib.PDFDocumentProxy | null;
  currentPage: number;
  formFields: FormField[];
  selectedFieldId: string | null;
  scale: number;
  onFieldSelect: (id: string | null) => void;
  onFieldMove: (id: string, x: number, y: number) => void;
  onFieldResize: (id: string, width: number, height: number) => void;
  onTotalPagesChange: (total: number) => void;
  isDocumentLoading?: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({
  pdfDocument,
  currentPage,
  formFields,
  selectedFieldId,
  scale,
  onFieldSelect,
  onFieldMove,
  onFieldResize,
  onTotalPagesChange,
  isDocumentLoading
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendering, setRendering] = useState(false);
  const [dragging, setDragging] = useState<{ fieldId: string; startX: number; startY: number; offsetX: number; offsetY: number } | null>(null);
  const [resizing, setResizing] = useState<{ fieldId: string; startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const isRenderingRef = useRef(false);

  // Render current page
  const renderPage = useCallback(async () => {
    if (!pdfDocument || !canvasRef.current || isRenderingRef.current) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    isRenderingRef.current = true;
    setRendering(true);

    try {
      const page = await pdfDocument.getPage(currentPage + 1);
      const viewport = page.getViewport({ scale: scale * 1.5 });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      // Update dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      renderTaskRef.current = page.render({
        canvasContext: context,
        viewport,
        canvas: canvasRef.current!
      });

      await renderTaskRef.current.promise;
    } catch (error) {
      if (error instanceof Error && error.name === 'RenderingCancelledException') {
        // Normal cancellation
      } else {
        console.error('Error rendering page:', error);
      }
    } finally {
      renderTaskRef.current = null;
      isRenderingRef.current = false;
      setRendering(false);
    }
  }, [pdfDocument, currentPage, scale]);

  useEffect(() => {
    // Small delay to ensure container size is stabilized
    const timer = setTimeout(() => {
      renderPage();
    }, 50);
    return () => {
      clearTimeout(timer);
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [renderPage]);

  useEffect(() => {
    if (pdfDocument) {
      onTotalPagesChange(pdfDocument.numPages);
    }
  }, [pdfDocument, onTotalPagesChange]);

  // Handle mouse down on field
  const handleFieldMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    onFieldSelect(fieldId);

    const field = formFields.find(f => f.id === fieldId);
    if (!field) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / (scale * 1.5);
    const y = (e.clientY - rect.top) / (scale * 1.5);

    // Check if clicking on resize handle (bottom-right corner)
    const isResizeHandle =
      x >= field.x + field.width - 10 &&
      x <= field.x + field.width &&
      y >= field.y + field.height - 10 &&
      y <= field.y + field.height;

    if (isResizeHandle) {
      setResizing({
        fieldId,
        startX: x,
        startY: y,
        startWidth: field.width,
        startHeight: field.height,
      });
    } else {
      setDragging({
        fieldId,
        startX: x,
        startY: y,
        offsetX: x - field.x,
        offsetY: y - field.y,
      });
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / (scale * 1.5);
    const y = (e.clientY - rect.top) / (scale * 1.5);

    if (dragging) {
      const newX = Math.max(0, x - dragging.offsetX);
      const newY = Math.max(0, y - dragging.offsetY);
      onFieldMove(dragging.fieldId, newX, newY);
    } else if (resizing) {
      const deltaX = x - resizing.startX;
      const deltaY = y - resizing.startY;
      const newWidth = Math.max(20, resizing.startWidth + deltaX);
      const newHeight = Math.max(15, resizing.startHeight + deltaY);
      onFieldResize(resizing.fieldId, newWidth, newHeight);
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
  };

  // Handle canvas click (deselect)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onFieldSelect(null);
    }
  };

  // Get fields for current page
  const currentPageFields = formFields.filter(field => field.page === currentPage);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center p-8 min-w-full min-h-full"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="relative shadow-2xl" style={{ cursor: dragging || resizing ? 'move' : 'default' }}>
        <canvas
          ref={canvasRef}
          className="bg-white block"
          onClick={handleCanvasClick}
        />

        {(isDocumentLoading || rendering || !pdfDocument) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50">
            <Loader2 className="w-8 h-8 animate-spin text-ocean-500" />
          </div>
        )}

        {/* Render form fields as overlays */}
        {!isDocumentLoading && pdfDocument && currentPageFields.map(field => (
          <div
            key={field.id}
            className={`absolute border-2 ${selectedFieldId === field.id
              ? 'border-ocean-500 bg-ocean-100/30 dark:bg-ocean-500/20 z-10'
              : 'border-gray-400 bg-gray-200/30 dark:bg-gray-600/20 hover:border-ocean-400 z-0'
              } cursor-move`}
            style={{
              left: field.x * scale * 1.5,
              top: field.y * scale * 1.5,
              width: field.width * scale * 1.5,
              height: field.height * scale * 1.5,
            }}
            onMouseDown={(e) => handleFieldMouseDown(e, field.id)}
          >
            {/* Field label */}
            <div className="absolute -top-6 left-0 text-[10px] bg-gray-800 text-white px-2 py-0.5 rounded whitespace-nowrap opacity-80 pointer-events-none">
              {field.name}
            </div>

            {/* Field type indicator */}
            <div className="flex items-center justify-center h-full text-[10px] text-gray-600 dark:text-gray-300 font-mono pointer-events-none select-none">
              {field.type === 'text' && '📝 Text'}
              {field.type === 'multiline' && '📄 Multi'}
              {field.type === 'checkbox' && '☑️'}
              {field.type === 'radio' && '🔘'}
              {field.type === 'dropdown' && '▼'}
            </div>

            {/* Resize handle */}
            {selectedFieldId === field.id && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-ocean-500 cursor-se-resize"
                style={{ marginBottom: -1, marginRight: -1 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
