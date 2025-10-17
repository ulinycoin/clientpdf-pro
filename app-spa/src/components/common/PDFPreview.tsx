import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface PDFPreviewProps {
  file: File;
  width?: number;
  height?: number;
  pageNumber?: number; // Which page to show (default: 1)
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  file,
  width = 120,
  height = 160,
  pageNumber = 1,
  onLoad,
  onError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const renderPreview = async () => {
      if (!canvasRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load PDF
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        // Get the specified page (or first page if invalid)
        const pageNum = Math.min(Math.max(1, pageNumber), pdf.numPages);
        const page = await pdf.getPage(pageNum);

        if (!isMounted) return;

        // Calculate scale to fit within bounds
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(
          width / viewport.width,
          height / viewport.height
        );
        const scaledViewport = page.getViewport({ scale });

        // Set canvas dimensions
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // Render page
        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;

        if (isMounted) {
          setIsLoading(false);
          onLoad?.();
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error('Failed to render PDF');
          setError(error.message);
          setIsLoading(false);
          onError?.(error);
        }
      }
    };

    renderPreview();

    return () => {
      isMounted = false;
    };
  }, [file, width, height, pageNumber, onLoad, onError]);

  return (
    <div
      className="pdf-preview relative flex items-center justify-center bg-white rounded-lg overflow-hidden shadow-sm"
      style={{ width, height }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-privacy-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-error-50 dark:bg-error-900/20">
          <div className="text-xs text-error-600 dark:text-error-400 p-2 text-center">
            Failed to load
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`max-w-full max-h-full ${isLoading || error ? 'hidden' : ''}`}
      />
    </div>
  );
};
