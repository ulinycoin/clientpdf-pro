import React, { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { useI18n } from '../../../../hooks/useI18n';
import { WatermarkConfig, PageNumberConfig } from '../../../../types/editPDF.types';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DesignPreviewProps {
  pdfFile: File;
  watermark: WatermarkConfig;
  pageNumbers: PageNumberConfig;
  selectedPages: number[];
  totalPages: number;
  pages: any[]; // PageState[] to check for blank pages
}

const DesignPreview: React.FC<DesignPreviewProps> = ({
  pdfFile,
  watermark,
  pageNumbers,
  selectedPages,
  totalPages,
  pages,
}) => {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfFile) {
      console.log('[DesignPreview] Missing pdfFile');
      return;
    }

    // Wait for canvas to be available in DOM
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('[DesignPreview] Canvas ref not yet available, will retry');
      // Canvas should be available on next render
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          console.log('[DesignPreview] Canvas now available, triggering re-render');
          setIsLoading(true); // Force re-render
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    let isCancelled = false;

    const renderPreview = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[DesignPreview] Starting render...');
        console.log('[DesignPreview] pdfFile:', pdfFile.name, pdfFile.size);

        // Get the page to preview
        const pageIndex = selectedPages.length > 0 ? selectedPages[0] : 0;
        console.log('[DesignPreview] Page index:', pageIndex, 'Total pages:', totalPages);

        if (pageIndex >= totalPages) {
          console.error('[DesignPreview] Invalid page index');
          setError('Selected page not found');
          setIsLoading(false);
          return;
        }

        // Check if this is a blank page
        const currentPage = pages[pageIndex];
        const isBlankPage = currentPage && currentPage.originalIndex === -1;
        console.log('[DesignPreview] Is blank page:', isBlankPage);

        const canvas = canvasRef.current;
        if (!canvas) {
          console.error('[DesignPreview] Canvas ref lost');
          return;
        }

        const context = canvas.getContext('2d');
        if (!context) {
          console.error('[DesignPreview] Cannot get 2d context');
          return;
        }

        let canvasWidth: number, canvasHeight: number;

        if (isBlankPage) {
          // Render blank page (A4 size)
          console.log('[DesignPreview] Rendering blank page...');
          const maxWidth = 500;
          const a4Width = 595; // A4 width in points
          const a4Height = 842; // A4 height in points
          const scale = maxWidth / a4Width;

          canvasWidth = a4Width * scale;
          canvasHeight = a4Height * scale;

          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

          // Fill with white background
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvasWidth, canvasHeight);

          console.log('[DesignPreview] Blank page rendered');
        } else {
          // Render actual PDF page
          console.log('[DesignPreview] Reading file...');
          const arrayBuffer = await pdfFile.arrayBuffer();
          console.log('[DesignPreview] File loaded, size:', arrayBuffer.byteLength);

          if (isCancelled) return;

          console.log('[DesignPreview] Loading with pdf.js...');
          const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          console.log('[DesignPreview] PDF loaded, pages:', pdf.numPages);

          if (isCancelled) {
            pdf.destroy();
            return;
          }

          // Map to original page index
          const originalPageIndex = currentPage.originalIndex;
          console.log('[DesignPreview] Getting page', originalPageIndex + 1);
          const page = await pdf.getPage(originalPageIndex + 1);
          console.log('[DesignPreview] Page loaded');

          // Calculate scale
          const maxWidth = 500;
          const viewport = page.getViewport({ scale: 1 });
          const scale = maxWidth / viewport.width;
          const scaledViewport = page.getViewport({ scale });

          canvasWidth = scaledViewport.width;
          canvasHeight = scaledViewport.height;

          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

          console.log('[DesignPreview] Rendering page...');
          await page.render({
            canvasContext: context,
            viewport: scaledViewport,
          }).promise;
          console.log('[DesignPreview] Page rendered');
        }

        // Draw watermark if enabled
        if (watermark.enabled && watermark.text.trim()) {
          const shouldShow = selectedPages.length === 0 || selectedPages.includes(pageIndex);
          if (shouldShow) {
            console.log('[DesignPreview] Drawing watermark...');
            drawWatermark(context, canvasWidth, canvasHeight, watermark);
          }
        }

        // Draw page numbers if enabled
        if (pageNumbers.enabled) {
          console.log('[DesignPreview] Drawing page number...');
          drawPageNumber(context, canvasWidth, canvasHeight, pageNumbers, pageIndex, totalPages);
        }

        console.log('[DesignPreview] Render complete');
        if (!isCancelled) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[DesignPreview] Error:', err);
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render preview');
          setIsLoading(false);
        }
      }
    };

    renderPreview();

    return () => {
      console.log('[DesignPreview] Cleanup');
      isCancelled = true;
    };
  }, [pdfFile, watermark, pageNumbers, selectedPages, totalPages, pages]);

  const drawWatermark = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: WatermarkConfig
  ) => {
    ctx.save();

    ctx.font = `${config.fontSize}px Arial`;
    ctx.fillStyle = config.color;
    ctx.globalAlpha = config.opacity / 100;

    const textWidth = ctx.measureText(config.text).width;
    const textHeight = config.fontSize;
    let x: number, y: number;

    if (config.position === 'diagonal') {
      // Center the watermark for diagonal rotation
      x = width / 2;
      y = height / 2;

      // Translate to center, rotate, then draw text centered
      ctx.translate(x, y);
      ctx.rotate((config.angle * Math.PI) / 180);
      ctx.fillText(config.text, -textWidth / 2, textHeight / 3);
    } else {
      // Position without rotation
      const margin = 50;
      switch (config.position) {
        case 'center':
          x = width / 2;
          y = height / 2;
          break;
        case 'top-left':
          x = margin;
          y = margin + textHeight;
          break;
        case 'top-right':
          x = width - textWidth - margin;
          y = margin + textHeight;
          break;
        case 'bottom-left':
          x = margin;
          y = height - margin;
          break;
        case 'bottom-right':
          x = width - textWidth - margin;
          y = height - margin;
          break;
        default:
          x = width / 2;
          y = height / 2;
      }

      ctx.translate(x, y);
      ctx.rotate((config.angle * Math.PI) / 180);
      ctx.fillText(config.text, 0, 0);
    }

    ctx.restore();
  };

  const drawPageNumber = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: PageNumberConfig,
    pageIndex: number,
    total: number
  ) => {
    ctx.save();

    ctx.font = `${config.fontSize}px ${config.fontFamily || 'Helvetica'}`;
    ctx.fillStyle = config.color;
    ctx.globalAlpha = 1;

    const pageNum = pageIndex + config.startNumber;
    const text = config.format
      .replace('{n}', String(pageNum))
      .replace('{total}', String(total));

    const textWidth = ctx.measureText(text).width;
    const margin = 30;

    let x = width / 2 - textWidth / 2;
    let y = height - margin;

    const positions: Record<string, { x: number; y: number }> = {
      'top-left': { x: margin, y: margin + config.fontSize },
      'top-center': { x: width / 2 - textWidth / 2, y: margin + config.fontSize },
      'top-right': { x: width - textWidth - margin, y: margin + config.fontSize },
      'bottom-left': { x: margin, y: height - margin },
      'bottom-center': { x: width / 2 - textWidth / 2, y: height - margin },
      'bottom-right': { x: width - textWidth - margin, y: height - margin },
    };

    if (positions[config.position]) {
      x = positions[config.position].x;
      y = positions[config.position].y;
    }

    ctx.fillText(text, x, y);
    ctx.restore();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('common.preview')}
      </h3>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800 dark:text-red-200">❌ {error}</p>
        </div>
      )}

      <div className="flex justify-center relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="border border-gray-300 dark:border-gray-600 rounded shadow-lg max-w-full h-auto"
          style={{ minHeight: '400px', minWidth: '300px' }}
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4 space-y-1">
        <p>
          {selectedPages.length > 0
            ? `${t('tools.edit.design.preview.selectedPage')} ${selectedPages[0] + 1}`
            : t('tools.edit.design.preview.firstPage')}
        </p>
        {selectedPages.length > 1 && (
          <p className="text-ocean-600 dark:text-ocean-400">
            ℹ️ Showing first of {selectedPages.length} selected pages
          </p>
        )}
      </div>
    </div>
  );
};

export default DesignPreview;
