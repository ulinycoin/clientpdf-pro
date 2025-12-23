import React, { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFMultiPagePreviewProps {
  file: File;
  maxPages?: number;
  pageWidth?: number;
  onError?: (error: Error) => void;
}

export const PDFMultiPagePreview: React.FC<PDFMultiPagePreviewProps> = ({
  file,
  maxPages = 20,
  pageWidth = 200,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [renderedCount, setRenderedCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;

    const renderPages = async () => {
      try {
        console.log('PDFMultiPagePreview: Starting render for', file.name);
        setIsLoading(true);
        setError(null);
        setPageImages([]);
        setRenderedCount(0);

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        pdfDoc = await loadingTask.promise;

        if (!isMounted) return;

        const numPages = pdfDoc.numPages;
        setTotalPages(numPages);
        setIsLoading(false); // Show partial results as they come

        const pagesToRender = Math.min(numPages, maxPages);

        for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
          if (!isMounted) break;

          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1 });
          const scale = pageWidth / viewport.width;
          const scaledViewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;

          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;

          await page.render({
            canvasContext: context,
            viewport: scaledViewport,
            canvas: canvas as HTMLCanvasElement // Add this to satisfy some versions of pdfjs types
          }).promise;

          if (isMounted) {
            const dataUrl = canvas.toDataURL('image/png');
            setPageImages(prev => [...prev, dataUrl]);
            setRenderedCount(pageNum);
          }

          // Clean up page
          page.cleanup();
        }
      } catch (err) {
        console.error('PDFMultiPagePreview error:', err);
        if (isMounted) {
          const error = err instanceof Error ? err : new Error('Failed to render PDF');
          setError(error.message);
          setIsLoading(false);
          onError?.(error);
        }
      }
    };

    renderPages();

    return () => {
      isMounted = false;
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [file, maxPages, pageWidth, onError]);

  if (isLoading && pageImages.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error && pageImages.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 border-2 border-dashed border-red-200 rounded-xl bg-red-50/50">
        <div className="text-center text-red-600">
          <p className="font-bold mb-1">Failed to load preview</p>
          <p className="text-xs opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-multi-page-preview space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {pageImages.map((imageUrl, index) => (
          <div
            key={index}
            className="group relative bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-ocean-300 transition-all duration-200"
            style={{ width: pageWidth + 16 }}
          >
            <div className="relative rounded overflow-hidden bg-gray-100">
              <img
                src={imageUrl}
                alt={`Page ${index + 1}`}
                className="w-full h-auto block"
              />
              <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {index + 1} / {totalPages}
              </div>
            </div>
            <div className="mt-2 text-center text-[10px] text-gray-400 font-medium">
              Page {index + 1}
            </div>
          </div>
        ))}

        {renderedCount < totalPages && renderedCount < maxPages && (
          <div
            className="flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 animate-pulse"
            style={{ width: pageWidth + 16, height: (pageWidth * 1.4) }}
          >
            <p className="text-xs text-gray-400">Rendering...</p>
          </div>
        )}
      </div>

      {totalPages > maxPages && (
        <div className="p-4 bg-ocean-50/50 dark:bg-ocean-900/10 rounded-xl border border-ocean-100 dark:border-ocean-900/20 text-center">
          <p className="text-xs text-ocean-700 dark:text-ocean-300 font-medium">
            Showing first {maxPages} pages of {totalPages}.
          </p>
        </div>
      )}
    </div>
  );
};
