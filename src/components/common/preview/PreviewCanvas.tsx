import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export type PreviewCanvasFit = 'contain' | 'cover';

interface PreviewCanvasProps {
  file?: File;
  blob?: Blob;
  pageNumber?: number;
  fit?: PreviewCanvasFit;
  className?: string;
  onStateChange?: (state: 'loading' | 'ready' | 'error', error?: Error) => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  file,
  blob,
  pageNumber = 1,
  fit = 'contain',
  className = '',
  onStateChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setContainerSize({ width, height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;
    let renderTask: pdfjsLib.PDFRenderTask | null = null;

    const renderPreview = async () => {
      const source = blob || file;
      if (!source || !canvasRef.current || !containerRef.current) {
        return;
      }
      if (!containerSize.width || !containerSize.height) {
        return;
      }

      try {
        setState('loading');
        setErrorMessage(null);
        onStateChange?.('loading');

        const arrayBuffer = await source.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        pdfDoc = await loadingTask.promise;

        if (!isMounted) return;

        const pageNum = Math.min(Math.max(1, pageNumber), pdfDoc.numPages);
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1 });

        const scaleX = containerSize.width / viewport.width;
        const scaleY = containerSize.height / viewport.height;
        const scale = fit === 'cover' ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
        const scaledViewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Failed to create canvas context');

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        renderTask = page.render({
          canvasContext: context,
          viewport: scaledViewport,
          canvas,
        } as pdfjsLib.RenderParameters);

        await renderTask.promise;
        page.cleanup();

        if (isMounted) {
          setState('ready');
          onStateChange?.('ready');
        }
      } catch (err) {
        if (!isMounted) return;
        const error = err instanceof Error ? err : new Error('Failed to render PDF');
        console.error('PreviewCanvas error:', error);
        setErrorMessage(error.message);
        setState('error');
        onStateChange?.('error', error);
      }
    };

    renderPreview();

    return () => {
      isMounted = false;
      if (renderTask && 'cancel' in renderTask) {
        renderTask.cancel();
      }
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [blob, file, pageNumber, fit, containerSize.width, containerSize.height, onStateChange]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      {state === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-privacy-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ocean-500 border-t-transparent" />
          <div className="text-xs font-medium">Loading preview...</div>
        </div>
      )}

      {state === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center text-error-600 dark:text-error-400">
          <div className="text-xs font-semibold">Failed to load preview</div>
          {errorMessage && <div className="text-[10px] opacity-80">{errorMessage}</div>}
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={[
          'max-w-full max-h-full transition-opacity duration-300',
          state === 'ready' ? 'opacity-100' : 'opacity-0',
          className,
        ].join(' ')}
      />
    </div>
  );
};
