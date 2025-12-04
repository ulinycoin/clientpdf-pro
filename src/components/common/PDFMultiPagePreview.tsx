import React, { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Button } from '@/components/ui/button';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFMultiPagePreviewProps {
  file: File;
  maxPages?: number; // Maximum number of pages to show (default: all)
  pageWidth?: number; // Width of each page preview
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
  const [totalPages, setTotalPages] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const renderPages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load PDF
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        const numPages = pdf.numPages;
        setTotalPages(numPages);

        // Render pages up to maxPages or all if showAll
        const pagesToRender = showAll ? numPages : Math.min(numPages, maxPages);
        const images: string[] = [];

        for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
          if (!isMounted) break;

          const page = await pdf.getPage(pageNum);

          // Calculate scale to fit page width
          const viewport = page.getViewport({ scale: 1 });
          const scale = pageWidth / viewport.width;
          const scaledViewport = page.getViewport({ scale });

          // Create canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;

          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;

          // Render page
          await page.render({
            canvasContext: context,
            viewport: scaledViewport,
          }).promise;

          // Convert to image
          images.push(canvas.toDataURL('image/png'));
        }

        if (isMounted) {
          setPageImages(images);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error('Failed to render PDF');
          console.error('PDFMultiPagePreview error:', error);
          setError(error.message);
          setIsLoading(false);
          onError?.(error);
        }
      }
    };

    renderPages();

    return () => {
      isMounted = false;
    };
  }, [file, maxPages, pageWidth, onError, showAll]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-ocean-500 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="text-sm">Failed to load preview</p>
          <p className="text-xs mt-1 text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-multi-page-preview">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pageImages.map((imageUrl, index) => (
          <div
            key={index}
            className="relative border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-ocean-500 transition-colors"
          >
            <img
              src={imageUrl}
              alt={`Page ${index + 1}`}
              className="w-full h-auto"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 px-2 text-center">
              Page {index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {!showAll && totalPages > maxPages && (
        <div className="mt-4 text-center">
          <Button
            onClick={() => setShowAll(true)}
            variant="outline"
            className="text-sm"
          >
            Show all {totalPages} pages
          </Button>
        </div>
      )}

      {/* Summary */}
      {totalPages > pageImages.length && !showAll && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Showing {pageImages.length} of {totalPages} pages
        </p>
      )}
    </div>
  );
};
