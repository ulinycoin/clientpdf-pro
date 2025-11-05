import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { FormField } from '@/types/formFields';

interface CanvasProps {
  pdfFile: File | null;
  currentPage: number;
  formFields: FormField[];
  selectedFieldId: string | null;
  scale: number;
  onFieldSelect: (id: string | null) => void;
  onFieldMove: (id: string, x: number, y: number) => void;
  onFieldResize: (id: string, width: number, height: number) => void;
  onPageChange: (page: number) => void;
  onTotalPagesChange: (total: number) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  pdfFile,
  currentPage,
  formFields,
  selectedFieldId,
  scale,
  onFieldSelect,
  onFieldMove,
  onFieldResize,
  onPageChange,
  onTotalPagesChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [rendering, setRendering] = useState(false);
  const [dragging, setDragging] = useState<{ fieldId: string; startX: number; startY: number; offsetX: number; offsetY: number } | null>(null);
  const [resizing, setResizing] = useState<{ fieldId: string; startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  // Load PDF document
  useEffect(() => {
    if (!pdfFile) return;

    const loadPdf = async () => {
      try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        onTotalPagesChange(pdf.numPages);
        if (currentPage >= pdf.numPages) {
          onPageChange(0);
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();
  }, [pdfFile]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || rendering) return;

    const renderPage = async () => {
      setRendering(true);
      try {
        const page = await pdfDoc.getPage(currentPage + 1);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;
      } catch (error) {
        console.error('Error rendering page:', error);
      } finally {
        setRendering(false);
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, scale]);

  // Handle mouse down on field
  const handleFieldMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    onFieldSelect(fieldId);

    const field = formFields.find(f => f.id === fieldId);
    if (!field) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

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

    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

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
      className="relative w-full h-full overflow-auto bg-gray-100 dark:bg-gray-800 flex items-start justify-center p-8"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="relative" style={{ cursor: dragging || resizing ? 'move' : 'default' }}>
        <canvas
          ref={canvasRef}
          className="shadow-lg"
          onClick={handleCanvasClick}
        />
        {/* Render form fields as overlays */}
        {currentPageFields.map(field => (
          <div
            key={field.id}
            className={`absolute border-2 ${
              selectedFieldId === field.id
                ? 'border-ocean-500 bg-ocean-100/30 dark:bg-ocean-500/20'
                : 'border-gray-400 bg-gray-200/30 dark:bg-gray-600/20 hover:border-ocean-400'
            } cursor-move`}
            style={{
              left: field.x * scale,
              top: field.y * scale,
              width: field.width * scale,
              height: field.height * scale,
            }}
            onMouseDown={(e) => handleFieldMouseDown(e, field.id)}
          >
            {/* Field label */}
            <div className="absolute -top-6 left-0 text-xs bg-gray-800 text-white px-2 py-1 rounded whitespace-nowrap">
              {field.name}
            </div>

            {/* Field type indicator */}
            <div className="flex items-center justify-center h-full text-xs text-gray-600 dark:text-gray-300 font-mono">
              {field.type === 'text' && '📝 Text'}
              {field.type === 'multiline' && '📄 Multiline'}
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
