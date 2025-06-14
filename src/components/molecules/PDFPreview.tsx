import React, { useEffect, useState, useRef } from 'react';
import { clsx } from 'clsx';
import { FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../atoms/Button';

// Импортируем PDF.js динамически, чтобы избежать проблем с SSR
let pdfjsLib: any = null;

interface PDFPreviewProps {
  file: File;
  className?: string;
  onPagesLoaded?: (numPages: number) => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ 
  file, 
  className,
  onPagesLoaded 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);

  // Инициализация PDF.js
    useEffect(() => {
      const initPDFJS = async () => {
        try {
          console.log('🔄 Initializing PDF.js...');
          if (!pdfjsLib) {
            console.log('📦 Loading pdfjs-dist...');
            pdfjsLib = await import('pdfjs-dist');
            console.log('✅ PDF.js loaded successfully');
          
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
            console.log('🔧 Worker configured');
          } else {
            console.log('♻️ PDF.js already loaded');
          }
        } catch (err) {
          console.error('❌ Failed to load PDF.js:', err);
        }
      };

      initPDFJS();
    }, []);

  // Загрузка и рендеринг PDF
  useEffect(() => {
    let isMounted = true;

	const loadPDF = async () => {
	      console.log('🎯 loadPDF called, pdfjsLib exists:', !!pdfjsLib);
      
	      if (!pdfjsLib || !file) {
	        console.log('❌ Missing pdfjsLib or file:', { pdfjsLib: !!pdfjsLib, file: !!file });
	        return;
	      }

	      setLoading(true);
	      setError('');

	      try {
	        console.log('📄 Loading PDF:', file.name, 'size:', file.size);
        
	        const arrayBuffer = await file.arrayBuffer();
	        console.log('📦 ArrayBuffer loaded, size:', arrayBuffer.byteLength);
        
	        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
	        console.log('🔄 PDF loading task created');
        
	        const pdf = await loadingTask.promise;
	        console.log('✅ PDF loaded successfully');
        
	        if (!isMounted) return;

	        pdfDocRef.current = pdf;
	        const totalPages = pdf.numPages;
	        console.log('📚 Total pages:', totalPages);
        
	        setNumPages(totalPages);
	        onPagesLoaded?.(totalPages);

	        // Рендерим первую страницу
	        console.log('🎨 Starting to render page 1');
	        await renderPage(pdf, 1);
        
	        if (isMounted) {
	          console.log('✅ PDF loading complete');
	          setLoading(false);
	        }

	      } catch (err: any) {
	        console.error('❌ Error loading PDF:', err);
	        if (isMounted) {
	          setError(err.message || 'Failed to load PDF');
	          setLoading(false);
	        }
	      }
	    };

    // Небольшая задержка, чтобы PDF.js успел загрузиться
    const timer = setTimeout(loadPDF, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
      }
    };
  }, [file, onPagesLoaded]); // Убрали pdfjsLib из зависимостей

  // Рендеринг страницы
    const renderPage = async (pdf: any, pageNumber: number) => {
      if (!canvasRef.current || !pdf) return;

      try {
        console.log('Rendering page:', pageNumber, 'scale:', scale);
      
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
      
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;
      
        // Очищаем canvas перед новым рендерингом
        canvas.width = viewport.width;
        canvas.height = viewport.height;
      
        // Очищаем фон
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        console.log('Page rendered successfully');
      } catch (err) {
        console.error('Error rendering page:', err);
      }
    };

  // Обновление масштаба - добавляем debounce
    useEffect(() => {
      if (pdfDocRef.current && !loading) {
        const timer = setTimeout(() => {
          renderPage(pdfDocRef.current, currentPage);
        }, 100); // Небольшая задержка для плавности

        return () => clearTimeout(timer);
      }
    }, [scale, currentPage, loading]);

  // Навигация по страницам
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= numPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleZoom = (newScale: number) => {
      if (newScale >= 0.5 && newScale <= 3) {
        console.log('Zoom changed:', scale, '->', newScale);
        setScale(newScale);
      }
    };

  if (loading) {
    return (
      <div className={clsx('bg-gray-50 rounded-lg flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx('bg-red-50 rounded-lg flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-2">Failed to load PDF</p>
          <p className="text-red-600 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-2">Showing placeholder instead</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronLeft}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            />
            <span className="text-sm text-gray-600 min-w-[80px] text-center">
              {currentPage} of {numPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronRight}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= numPages}
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              icon={ZoomOut}
              onClick={() => handleZoom(scale - 0.2)}
              disabled={scale <= 0.5}
            />
            <span className="text-sm text-gray-600 min-w-[50px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon={ZoomIn}
              onClick={() => handleZoom(scale + 0.2)}
              disabled={scale >= 3}
            />
          </div>
        </div>

        {/* File Info */}
        <div className="text-sm text-gray-600">
          {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
        </div>
      </div>

	  {/* PDF Canvas */}
      <div className="p-4 overflow-auto bg-gray-50" style={{ minHeight: '500px' }}>
        <div className="flex justify-center items-center">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded shadow-sm"
            style={{ 
              display: 'block',
              backgroundColor: 'white',
              maxWidth: 'none',
              maxHeight: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};