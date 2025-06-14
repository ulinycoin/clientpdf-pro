import React, { useEffect, useState, useRef } from 'react';
import { clsx } from 'clsx';
import { FileText, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { Button } from '../atoms/Button';

interface PDFPreviewProps {
  file: File;
  className?: string;
  onPagesLoaded?: (numPages: number) => void;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ 
  file, 
  className,
  onPagesLoaded 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  // Загружаем PDF.js
  useEffect(() => {
    const loadPDFJS = async () => {
      if (!window.pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        };
        document.head.appendChild(script);
        
        return new Promise((resolve) => {
          script.onload = resolve;
        });
      }
    };

    loadPDFJS();
  }, []);

  // Загружаем и отображаем PDF
  useEffect(() => {
    const loadPDF = async () => {
      if (!file || !window.pdfjsLib) return;

      try {
        setLoading(true);
        setError(null);

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        onPagesLoaded?.(pdf.numPages);
        
        await renderPage(pdf, pageNumber);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF. Please try a different file.');
        setLoading(false);
      }
    };

    loadPDF();
  }, [file, onPagesLoaded]);

  // Рендерим страницу
  const renderPage = async (pdf: any, pageNum: number) => {
    if (!pdf || !canvasRef.current) return;

    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Настраиваем viewport с учетом масштаба и поворота
      let viewport = page.getViewport({ scale, rotation });
      
      // Устанавливаем размеры canvas
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Очищаем canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Рендерим страницу
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
      setError('Error rendering PDF page');
    }
  };

  // Обновляем отображение при изменении параметров
  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, pageNumber);
    }
  }, [pdfDoc, pageNumber, scale, rotation]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  if (loading) {
    return (
      <div className={clsx(
        'bg-gray-50 rounded-lg flex items-center justify-center p-8',
        className
      )}>
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(
        'bg-red-50 rounded-lg flex items-center justify-center p-8',
        className
      )}>
        <div className="text-center">
          <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-700 font-medium">{error}</p>
          <p className="text-sm text-red-600 mt-2">
            {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">{file.name}</span>
          <span className="text-xs text-gray-500">
            ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-600 min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={scale >= 3}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleRotate}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Page Navigation */}
      {numPages > 1 && (
        <div className="flex items-center justify-center p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              ← Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {pageNumber} of {numPages}
            </span>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* PDF Canvas */}
      <div className="p-4 overflow-auto max-h-[600px] flex justify-center">
        <canvas 
          ref={canvasRef}
          className="border border-gray-300 shadow-sm"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>PDF Preview • {numPages} {numPages === 1 ? 'page' : 'pages'}</span>
          <span>Zoom: {Math.round(scale * 100)}% • Rotation: {rotation}°</span>
        </div>
      </div>
    </div>
  );
};