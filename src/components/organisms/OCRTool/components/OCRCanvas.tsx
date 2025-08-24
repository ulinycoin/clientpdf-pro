import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
}

interface OCRCanvasProps {
  file: File | null;
  currentPage: number;
  scale: number;
  selectionArea: SelectionArea | null;
  onSelectionChange: (area: SelectionArea | null) => void;
  onPageChange: (page: number) => void;
  onTotalPagesChange: (total: number) => void;
  className?: string;
}

const OCRCanvas: React.FC<OCRCanvasProps> = ({
  file,
  currentPage,
  scale,
  selectionArea,
  onSelectionChange,
  onPageChange,
  onTotalPagesChange,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const isRenderingRef = useRef(false);

  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentSelection, setCurrentSelection] = useState<SelectionArea | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [pageRendered, setPageRendered] = useState(false);

  // Load PDF document or handle image file
  useEffect(() => {
    if (!file) {
      setPdfDocument(null);
      return;
    }

    // ИСПРАВЛЕНИЕ: Проверяем тип файла перед попыткой загрузки как PDF
    if (file.type !== 'application/pdf') {
      console.log('📷 OCRCanvas: Image file detected, skipping PDF loading');
      setPdfDocument(null);
      onTotalPagesChange(1); // Images have only 1 "page"
      return;
    }

    const loadPDF = async () => {
      try {
        console.log('📄 OCRCanvas: Loading PDF file');
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDocument(pdf);
        onTotalPagesChange(pdf.numPages);
        
        // Reset to first page if current page is invalid
        if (currentPage > pdf.numPages) {
          onPageChange(1);
        }
      } catch (error) {
        console.error('❌ OCRCanvas: Error loading PDF:', error);
        setPdfDocument(null);
      }
    };

    loadPDF();
  }, [file, onTotalPagesChange, onPageChange, currentPage]);

  // Render PDF page or image
  const renderPage = useCallback(async () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container || !file || isRenderingRef.current) {
      return;
    }

    try {
      isRenderingRef.current = true;
      setPageRendered(false);

      // Cancel previous render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const context = canvas.getContext('2d');
      if (!context) return;

      // Handle PDF files
      if (file.type === 'application/pdf' && pdfDocument) {
        console.log('🖼️ OCRCanvas: Rendering PDF page', currentPage);
        
        const page = await pdfDocument.getPage(currentPage);
        const viewport = page.getViewport({ scale });

        // Set canvas dimensions
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Render page
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
      } 
      // Handle image files
      else if (file.type.startsWith('image/')) {
        console.log('🖼️ OCRCanvas: Rendering image file');
        
        const img = new Image();
        img.onload = () => {
          // Calculate display size with scale
          const displayWidth = img.naturalWidth * scale;
          const displayHeight = img.naturalHeight * scale;
          
          // Set canvas dimensions
          canvas.width = displayWidth;
          canvas.height = displayHeight;
          canvas.style.width = `${displayWidth}px`;
          canvas.style.height = `${displayHeight}px`;

          // Clear and draw image
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0, displayWidth, displayHeight);
          
          setPageRendered(true);
          isRenderingRef.current = false;
        };
        
        img.onerror = () => {
          console.error('❌ OCRCanvas: Failed to load image');
          isRenderingRef.current = false;
        };
        
        img.src = URL.createObjectURL(file);
        return; // Early return for image handling
      }
      
      setPageRendered(true);
    } catch (error) {
      if (error.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', error);
      }
    } finally {
      isRenderingRef.current = false;
      renderTaskRef.current = null;
    }
  }, [file, pdfDocument, currentPage, scale]);

  // Render page when dependencies change
  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Handle image files
  useEffect(() => {
    if (!file || file.type === 'application/pdf') return;

    const loadImage = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate dimensions maintaining aspect ratio
        const containerWidth = 800; // Max width
        const containerHeight = 600; // Max height
        
        let { width, height } = img;
        
        // Scale to fit container while maintaining aspect ratio
        const scaleX = containerWidth / width;
        const scaleY = containerHeight / height;
        const scaleFactor = Math.min(scaleX, scaleY, 1) * scale;
        
        width *= scaleFactor;
        height *= scaleFactor;

        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        setPageRendered(true);
        onTotalPagesChange(1);
      };

      img.src = URL.createObjectURL(file);
    };

    loadImage();
  }, [file, scale, onTotalPagesChange]);

  // Get canvas coordinates from mouse event
  const getCanvasCoordinates = (event: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return { x: 0, y: 0 };

    const rect = container.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / canvas.offsetWidth);
    const y = (event.clientY - rect.top) * (canvas.height / canvas.offsetHeight);
    
    return { x, y };
  };

  // Handle mouse down - start selection
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!pageRendered) return;
    
    const coords = getCanvasCoordinates(event);
    setIsSelecting(true);
    setStartPoint(coords);
    setCurrentSelection({
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0,
      isActive: true
    });
  };

  // Handle mouse move - update selection
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !pageRendered) return;

    const coords = getCanvasCoordinates(event);
    const width = coords.x - startPoint.x;
    const height = coords.y - startPoint.y;

    setCurrentSelection({
      x: width >= 0 ? startPoint.x : coords.x,
      y: height >= 0 ? startPoint.y : coords.y,
      width: Math.abs(width),
      height: Math.abs(height),
      isActive: true
    });
  };

  // Handle mouse up - finish selection
  const handleMouseUp = () => {
    if (!isSelecting) return;
    
    setIsSelecting(false);
    
    // Only keep selection if it has meaningful size
    if (currentSelection && currentSelection.width > 10 && currentSelection.height > 10) {
      onSelectionChange(currentSelection);
    } else {
      setCurrentSelection(null);
      onSelectionChange(null);
    }
  };

  // Clear selection on double-click
  const handleDoubleClick = () => {
    setCurrentSelection(null);
    onSelectionChange(null);
  };

  // Get display selection (current or saved)
  const displaySelection = currentSelection || selectionArea;

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      <div 
        ref={containerRef}
        className="relative inline-block bg-white shadow-lg m-4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: isSelecting ? 'crosshair' : 'default' }}
      >
        <canvas
          ref={canvasRef}
          className="block"
          style={{ 
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
        
        {/* Selection overlay */}
        {displaySelection && displaySelection.isActive && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 pointer-events-none"
            style={{
              left: `${(displaySelection.x / (canvasRef.current?.width || 1)) * 100}%`,
              top: `${(displaySelection.y / (canvasRef.current?.height || 1)) * 100}%`,
              width: `${(displaySelection.width / (canvasRef.current?.width || 1)) * 100}%`,
              height: `${(displaySelection.height / (canvasRef.current?.height || 1)) * 100}%`,
            }}
          >
            <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
              Selection Area
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {!pageRendered && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-sm px-3 py-2 rounded">
        {!displaySelection ? (
          "Click and drag to select area for OCR"
        ) : (
          "Double-click to clear selection"
        )}
      </div>
    </div>
  );
};

export default OCRCanvas;