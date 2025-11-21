import { useState, useEffect, useCallback, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface PageThumbnail {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

interface UsePDFThumbnailsOptions {
  file?: File | Blob;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  onProgress?: (current: number, total: number) => void;
}

interface UsePDFThumbnailsReturn {
  thumbnails: PageThumbnail[];
  isLoading: boolean;
  error: string | null;
  pageCount: number;
  regenerateThumbnails: () => Promise<void>;
}

export const usePDFThumbnails = ({
  file,
  thumbnailWidth = 150,
  thumbnailHeight = 200,
  onProgress,
}: UsePDFThumbnailsOptions): UsePDFThumbnailsReturn => {
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);

  // Use ref to avoid recreating callback on every render
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  const generateThumbnails = useCallback(async () => {
    if (!file) {
      setThumbnails([]);
      setPageCount(0);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load PDF
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const numPages = pdf.numPages;
      setPageCount(numPages);

      const generatedThumbnails: PageThumbnail[] = [];

      // Generate thumbnail for each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        // Calculate scale to fit within bounds
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(
          thumbnailWidth / viewport.width,
          thumbnailHeight / viewport.height
        );
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

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png');

        generatedThumbnails.push({
          pageNumber: pageNum,
          dataUrl,
          width: scaledViewport.width,
          height: scaledViewport.height,
        });

        // Report progress using ref
        onProgressRef.current?.(pageNum, numPages);
      }

      setThumbnails(generatedThumbnails);
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate thumbnails');
      console.error('usePDFThumbnails error:', error);
      setError(error.message);
      setIsLoading(false);
    }
  }, [file, thumbnailWidth, thumbnailHeight]);

  useEffect(() => {
    generateThumbnails();
  }, [generateThumbnails]);

  return {
    thumbnails,
    isLoading,
    error,
    pageCount,
    regenerateThumbnails: generateThumbnails,
  };
};
