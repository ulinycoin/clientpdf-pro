import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Loader2,
  AlertCircle
} from 'lucide-react';

import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';

interface PdfPreviewCanvasProps {
  pdfBlob: Blob | null;
  isGenerating: boolean;
  onError: (error: string) => void;
}

interface ViewerState {
  currentPage: number;
  totalPages: number;
  scale: number;
  rotation: number;
  isLoading: boolean;
  error: string | null;
}

// PDF.js types (основные)
declare global {
  interface Window {
    pdfjsLib: any;
    pdfjsWorker: any;
  }
}

export const PdfPreviewCanvas: React.FC<PdfPreviewCanvasProps> = ({
  pdfBlob,
  isGenerating,
  onError
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  const [viewerState, setViewerState] = useState<ViewerState>({
    currentPage: 1,
    totalPages: 0,
    scale: 1.0,
    rotation: 0,
    isLoading: false,
    error: null
  });

  // 📚 LOAD PDF.JS LIBRARY
  const loadPdfJs = useCallback(async () => {
    if (window.pdfjsLib) return true;

    try {
      // Загружаем PDF.js с CDN
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load PDF.js'));
        document.head.appendChild(script);
      });

      // Загружаем worker
      const workerScript = document.createElement('script');
      workerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      workerScript.async = true;
      
      await new Promise<void>((resolve, reject) => {
        workerScript.onload = () => resolve();
        workerScript.onerror = () => reject(new Error('Failed to load PDF.js worker'));
        document.head.appendChild(workerScript);
      });

      // Настройка PDF.js
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }

      return true;
    } catch (error) {
      console.error('PDF.js loading failed:', error);
      onError('Failed to load PDF viewer library');
      return false;
    }
  }, [onError]);

  // 📄 RENDER PDF PAGE
  const renderPage = useCallback(async (pageNumber: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return;

    // Отменяем предыдущий рендеринг
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    setViewerState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context not available');
      }

      // Вычисляем размеры с учетом масштаба и поворота
      const viewport = page.getViewport({ 
        scale: viewerState.scale,
        rotation: viewerState.rotation 
      });

      // Устанавливаем размеры canvas с учетом device pixel ratio для четкости
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = viewport.width * devicePixelRatio;
      canvas.height = viewport.height * devicePixelRatio;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      // Масштабируем контекст для четкости на retina дисплеях
      context.scale(devicePixelRatio, devicePixelRatio);

      // 🎨 РЕНДЕРИНГ СТРАНИЦЫ
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;

      setViewerState(prev => ({ ...prev, isLoading: false }));

    } catch (error: any) {
      if (error.name !== 'RenderingCancelledException') {
        console.error('Page rendering failed:', error);
        setViewerState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: `Rendering failed: ${error.message}` 
        }));
      }
    }
  }, [viewerState.scale, viewerState.rotation]);

  // 📚 LOAD PDF DOCUMENT
  const loadPdfDocument = useCallback(async (blob: Blob) => {
    if (!window.pdfjsLib) {
      const loaded = await loadPdfJs();
      if (!loaded) return;
    }

    setViewerState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const loadingTask = window.pdfjsLib.getDocument({ data: uint8Array });
      const pdfDoc = await loadingTask.promise;
      
      pdfDocRef.current = pdfDoc;
      
      setViewerState(prev => ({
        ...prev,
        totalPages: pdfDoc.numPages,
        currentPage: 1,
        isLoading: false,
        error: null
      }));

      // Рендерим первую страницу
      await renderPage(1);

    } catch (error) {
      console.error('PDF loading failed:', error);
      const errorMessage = `Failed to load PDF: ${error}`;
      setViewerState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      onError(errorMessage);
    }
  }, [loadPdfJs, renderPage, onError]);

  // 🔄 EFFECT: Load PDF when blob changes
  useEffect(() => {
    if (pdfBlob && !isGenerating) {
      loadPdfDocument(pdfBlob);
    }
  }, [pdfBlob, isGenerating, loadPdfDocument]);

  // 🔄 EFFECT: Re-render on scale/rotation change
  useEffect(() => {
    if (pdfDocRef.current && viewerState.currentPage > 0) {
      renderPage(viewerState.currentPage);
    }
  }, [viewerState.scale, viewerState.rotation, renderPage]);

  // 🎛️ NAVIGATION HANDLERS
  const goToPage = useCallback((pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= viewerState.totalPages) {
      setViewerState(prev => ({ ...prev, currentPage: pageNumber }));
      renderPage(pageNumber);
    }
  }, [viewerState.totalPages, renderPage]);

  const nextPage = useCallback(() => {
    goToPage(viewerState.currentPage + 1);
  }, [viewerState.currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(viewerState.currentPage - 1);
  }, [viewerState.currentPage, goToPage]);

  // 🔍 ZOOM HANDLERS
  const zoomIn = useCallback(() => {
    setViewerState(prev => ({ 
      ...prev, 
      scale: Math.min(prev.scale * 1.2, 3.0) 
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewerState(prev => ({ 
      ...prev, 
      scale: Math.max(prev.scale / 1.2, 0.5) 
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setViewerState(prev => ({ ...prev, scale: 1.0 }));
  }, []);

  // 🔄 ROTATION HANDLER
  const rotate = useCallback(() => {
    setViewerState(prev => ({ 
      ...prev, 
      rotation: (prev.rotation + 90) % 360 
    }));
  }, []);

  // 💾 DOWNLOAD HANDLER
  const downloadPdf = useCallback(() => {
    if (!pdfBlob) return;

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `preview_${new Date().getTime()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [pdfBlob]);

  // 🖱️ WHEEL ZOOM HANDLER
  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      if (event.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  }, [zoomIn, zoomOut]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* 🎛️ TOOLBAR */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-2">
          
          {/* 📄 PAGE NAVIGATION */}
          <div className="flex items-center space-x-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={prevPage}
              disabled={viewerState.currentPage <= 1 || viewerState.isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center space-x-2 px-3">
              <input
                type="number"
                min="1"
                max={viewerState.totalPages}
                value={viewerState.currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                disabled={viewerState.isLoading}
              />
              <span className="text-sm text-gray-500">
                / {viewerState.totalPages}
              </span>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={nextPage}
              disabled={viewerState.currentPage >= viewerState.totalPages || viewerState.isLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* 🔍 ZOOM CONTROLS */}
          <div className="flex items-center space-x-1 border-l border-gray-200 pl-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={zoomOut}
              disabled={viewerState.scale <= 0.5 || viewerState.isLoading}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <Badge variant="secondary" className="min-w-[60px] text-center">
              {Math.round(viewerState.scale * 100)}%
            </Badge>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={zoomIn}
              disabled={viewerState.scale >= 3.0 || viewerState.isLoading}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* 🔄 ADDITIONAL CONTROLS */}
          <div className="flex items-center space-x-1 border-l border-gray-200 pl-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={rotate}
              disabled={viewerState.isLoading}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={resetZoom}
              disabled={viewerState.isLoading}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 💾 DOWNLOAD BUTTON */}
        <Button
          onClick={downloadPdf}
          disabled={!pdfBlob || isGenerating}
          size="sm"
          className="flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {/* 📄 CANVAS CONTAINER */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4"
        onWheel={handleWheel}
      >
        {/* 🔄 LOADING STATE */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full"
          >
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                Generating PDF Preview...
              </h4>
              <p className="text-gray-500">
                This may take a moment for large datasets
              </p>
            </div>
          </motion.div>
        )}

        {/* ❌ ERROR STATE */}
        {!isGenerating && viewerState.error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center h-full"
          >
            <div className="text-center max-w-md">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                Preview Error
              </h4>
              <p className="text-red-600 text-sm mb-4">
                {viewerState.error}
              </p>
              <Button
                onClick={() => loadPdfDocument(pdfBlob!)}
                disabled={!pdfBlob}
                size="sm"
              >
                Retry Preview
              </Button>
            </div>
          </motion.div>
        )}

        {/* 📄 PDF CANVAS */}
        {!isGenerating && !viewerState.error && (
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative bg-white shadow-lg"
              style={{
                transform: `rotate(${viewerState.rotation}deg)`,
                transformOrigin: 'center center'
              }}
            >
              <canvas
                ref={canvasRef}
                className="block max-w-full h-auto"
                style={{ 
                  filter: viewerState.isLoading ? 'blur(2px) opacity(0.5)' : 'none',
                  transition: 'filter 0.2s ease-in-out'
                }}
              />
              
              {/* 🔄 PAGE LOADING OVERLAY */}
              {viewerState.isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* 🎯 EMPTY STATE */}
        {!isGenerating && !viewerState.error && !pdfBlob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full"
          >
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                No PDF to Preview
              </h4>
              <p className="text-gray-500">
                The PDF preview will appear here once your data is processed
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* 📊 STATUS BAR */}
      {viewerState.totalPages > 0 && !isGenerating && (
        <div className="border-t border-gray-200 bg-white px-4 py-2">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>
                Page {viewerState.currentPage} of {viewerState.totalPages}
              </span>
              <span>
                Scale: {Math.round(viewerState.scale * 100)}%
              </span>
              {viewerState.rotation > 0 && (
                <span>
                  Rotated: {viewerState.rotation}°
                </span>
              )}
            </div>
            <div className="text-xs">
              🖱️ Ctrl+Scroll to zoom • Click numbers to navigate
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfPreviewCanvas;