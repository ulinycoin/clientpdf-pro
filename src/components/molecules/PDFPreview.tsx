/**
 * Copyright (c) 2024 LocalPDF Team
 * 
 * This file is part of LocalPDF.
 * 
 * LocalPDF is proprietary software: you may not copy, modify, distribute,
 * or use this software except as expressly permitted under the LocalPDF
 * Source Available License v1.0.
 * 
 * See the LICENSE file in the project root for license terms.
 * For commercial licensing, contact: license@localpdf.online
 */


import React, { useEffect, useRef, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '../atoms/Button';
import { createPDFDocument, getPDFJSStatus } from '../../utils/pdfjs-initializer';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMountedRef = useRef(true);
  const renderingRef = useRef(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);

  // Cleanup при размонтировании
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      renderingRef.current = false;
    };
  }, []);

  // Загрузка PDF с использованием утилиты
  useEffect(() => {
    let mounted = true;
    
    const loadPDF = async () => {
      try {
        console.log('🔄 Starting PDF load with utility...');
        setIsLoading(true);
        setError('');

        // Чтение файла
        console.log('🔄 Reading file:', file.name);
        const arrayBuffer = await file.arrayBuffer();
        
        if (!mounted || !isMountedRef.current) {
          console.log('❌ Component unmounted during file read');
          return;
        }
        
        console.log('✅ File read, size:', arrayBuffer.byteLength);

        // Создание PDF документа через утилиту
        const pdf = await createPDFDocument(arrayBuffer);
        
        if (!mounted || !isMountedRef.current) {
          console.log('❌ Component unmounted during PDF creation');
          return;
        }
        
        console.log('✅ PDF document created, pages:', pdf.numPages);
        
        // Логируем статус PDF.js
        const status = getPDFJSStatus();
        console.log('📊 PDF.js status:', status);
        
        setPdfDocument(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setIsLoading(false);
        
        onPagesLoaded?.(pdf.numPages);
        
      } catch (err: any) {
        console.error('❌ Error loading PDF:', err);
        if (mounted && isMountedRef.current) {
          let errorMessage = 'Unknown error occurred';
          
          if (err?.message) {
            errorMessage = err.message;
          } else if (typeof err === 'string') {
            errorMessage = err;
          }
          
          // Более дружественные сообщения для пользователей
          if (errorMessage.includes('worker') || errorMessage.includes('Worker')) {
            errorMessage = 'PDF viewer initialization failed. Please try refreshing the page.';
          } else if (errorMessage.includes('Invalid PDF') || errorMessage.includes('PDF header')) {
            errorMessage = 'This file appears to be corrupted or is not a valid PDF.';
          } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            errorMessage = 'Network error. Please check your internet connection.';
          } else if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
            errorMessage = 'This PDF is password protected. Password-protected PDFs are not supported for preview.';
          }
          
          setError(`Failed to load PDF: ${errorMessage}`);
          setIsLoading(false);
        }
      }
    };

    loadPDF();
    
    return () => {
      mounted = false;
    };
  }, [file, onPagesLoaded]);

  // Функция безопасного рендеринга страницы
  const renderPage = useCallback(async (pageNumber: number) => {
    // Проверки безопасности
    if (!pdfDocument) {
      console.log('⏳ Cannot render: PDF document not loaded');
      return;
    }
    
    if (!canvasRef.current) {
      console.log('⏳ Cannot render: Canvas not available');
      return;
    }
    
    if (renderingRef.current) {
      console.log('⏳ Cannot render: Already rendering');
      return;
    }
    
    if (!isMountedRef.current) {
      console.log('⏳ Cannot render: Component unmounted');
      return;
    }

    try {
      renderingRef.current = true;
      console.log('🔄 Rendering page:', pageNumber);

      const page = await pdfDocument.getPage(pageNumber);
      
      // Повторная проверка после async операции
      if (!isMountedRef.current || !canvasRef.current) {
        console.log('❌ Component state changed during page load');
        return;
      }

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.error('❌ Cannot get canvas context');
        return;
      }

      // Рассчитываем размеры
      const viewport = page.getViewport({ 
        scale: scale,
        rotation: rotation 
      });

      // Устанавливаем размеры canvas
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Очищаем canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Рендерим страницу
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      
      if (isMountedRef.current) {
        console.log('✅ Page rendered successfully');
      }
      
    } catch (err: any) {
      console.error('❌ Error rendering page:', err);
      if (isMountedRef.current) {
        setError(`Failed to render page ${pageNumber}: ${err.message || 'Unknown error'}`);
      }
    } finally {
      renderingRef.current = false;
    }
  }, [pdfDocument, scale, rotation]);

  // Рендер текущей страницы при изменении
  useEffect(() => {
    if (pdfDocument && currentPage && !isLoading) {
      // Задержка для готовности DOM
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          renderPage(currentPage);
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [pdfDocument, currentPage, renderPage, isLoading]);

  // Навигация по страницам
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && !renderingRef.current) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Zoom функции
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  }, []);

  const rotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Функция повторной попытки
  const retryLoad = useCallback(() => {
    setError('');
    setIsLoading(true);
    setPdfDocument(null);
    setCurrentPage(1);
    setTotalPages(0);
  }, []);

  // Обработка ошибок загрузки
  if (error) {
    return (
      <div className={clsx(
        'bg-red-50 rounded-lg flex items-center justify-center p-8 border border-red-200',
        className
      )}>
        <div className="text-center">
          <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-2">Error loading PDF</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={retryLoad}
              className="block w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <p className="text-xs text-red-500">
              If the problem persists, try refreshing the page or using a different PDF file.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className={clsx(
        'bg-gray-50 rounded-lg flex items-center justify-center p-8',
        className
      )}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium mb-2">Loading PDF...</p>
          <p className="text-sm text-gray-500">{file.name}</p>
          <p className="text-xs text-gray-400 mt-2">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronLeft}
              onClick={previousPage}
              disabled={currentPage <= 1 || renderingRef.current}
            />
            <span className="text-sm text-gray-700 min-w-[80px] text-center">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronRight}
              onClick={nextPage}
              disabled={currentPage >= totalPages || renderingRef.current}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={ZoomOut}
            onClick={zoomOut}
            disabled={scale <= 0.5}
          />
          <span className="text-sm text-gray-600 min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon={ZoomIn}
            onClick={zoomIn}
            disabled={scale >= 3.0}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCw}
            onClick={rotate}
          />
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="p-4 overflow-auto max-h-[600px] bg-gray-100"
        style={{ minHeight: '400px' }}
      >
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 shadow-lg bg-white"
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </div>
      </div>

      {/* Footer info */}
      <div className="px-4 py-2 bg-gray-50 rounded-b-lg border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>📄 {file.name}</span>
          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
      </div>
    </div>
  );
};