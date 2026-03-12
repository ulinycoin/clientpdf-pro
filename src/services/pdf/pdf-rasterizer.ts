export interface PdfRasterizer {
  rasterize(pdfBlob: Blob): Promise<Blob[]>;
}

interface PdfPageLike {
  getViewport(params: { scale: number }): { width: number; height: number };
  render(params: {
    canvasContext: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    viewport: { width: number; height: number };
    annotationMode?: number;
    canvasFactory?: {
      create: (width: number, height: number) => { canvas: OffscreenCanvas | HTMLCanvasElement; context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D };
      reset: (target: { canvas: OffscreenCanvas | HTMLCanvasElement; context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D }, width: number, height: number) => void;
      destroy: (target: { canvas: OffscreenCanvas | HTMLCanvasElement; context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D }) => void;
    };
  }): { promise: Promise<void> };
}

interface PdfDocumentLike {
  numPages: number;
  getPage(page: number): Promise<PdfPageLike>;
}

interface PdfJsLike {
  getDocument(params: { data: ArrayBuffer; disableWorker: boolean; verbosity?: number }): { promise: Promise<PdfDocumentLike> };
  GlobalWorkerOptions?: { workerSrc?: string };
  VerbosityLevel?: { ERRORS?: number };
}

class PdfJsRasterizer implements PdfRasterizer {
  constructor(private pdfjs: PdfJsLike) { }

  private createCanvasFactory() {
    return {
      create: (width: number, height: number) => {
        const canvas =
          typeof OffscreenCanvas !== 'undefined'
            ? new OffscreenCanvas(width, height)
            : typeof document !== 'undefined'
              ? document.createElement('canvas')
              : null;
        if (!canvas) {
          throw new Error('Canvas factory cannot create canvas in this runtime');
        }
        if (typeof HTMLCanvasElement !== 'undefined' && canvas instanceof HTMLCanvasElement) {
          canvas.width = width;
          canvas.height = height;
        }
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Canvas factory failed to get 2d context');
        }
        return { canvas, context };
      },
      reset: (target: { canvas: OffscreenCanvas | HTMLCanvasElement }, width: number, height: number) => {
        target.canvas.width = width;
        target.canvas.height = height;
      },
      destroy: (target: { canvas: OffscreenCanvas | HTMLCanvasElement }) => {
        target.canvas.width = 0;
        target.canvas.height = 0;
      },
    };
  }

  async rasterize(pdfBlob: Blob): Promise<Blob[]> {
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const errorOnlyVerbosity = this.pdfjs.VerbosityLevel?.ERRORS ?? 0;
    const loadingTask = this.pdfjs.getDocument({ data: arrayBuffer, disableWorker: true, verbosity: errorOnlyVerbosity });
    const pdf = await loadingTask.promise;
    const blobs: Blob[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas =
        typeof OffscreenCanvas !== 'undefined'
          ? new OffscreenCanvas(viewport.width, viewport.height)
          : typeof document !== 'undefined'
            ? document.createElement('canvas')
            : null;

      if (!canvas) {
        throw new Error('Canvas environment not available for rasterization');
      }

      if (typeof HTMLCanvasElement !== 'undefined' && canvas instanceof HTMLCanvasElement) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
      }

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get 2d context for rasterization');
      }

      await page.render({
        canvasContext: context,
        viewport,
        annotationMode: 0,
        canvasFactory: this.createCanvasFactory(),
      }).promise;

      const blob = await new Promise<Blob | null>((resolve) => {
        if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
          canvas.convertToBlob({ type: 'image/png' }).then(resolve);
        } else if (typeof HTMLCanvasElement !== 'undefined' && canvas instanceof HTMLCanvasElement) {
          (canvas as any).toBlob(resolve, 'image/png');
        } else {
          resolve(null);
        }
      });

      if (!blob) {
        throw new Error(`Failed to create blob for page ${i}`);
      }
      blobs.push(blob);
    }

    return blobs;
  }
}

export async function createPdfRasterizer(): Promise<PdfRasterizer | null> {
  const canRasterize = typeof OffscreenCanvas !== 'undefined' || typeof document !== 'undefined';

  if (!canRasterize) {
    return null;
  }

  try {
    const pdfjs = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as unknown as PdfJsLike;
    if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
      const workerSrcMod = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')) as { default?: string };
      if (workerSrcMod.default) {
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrcMod.default;
      }
    }
    return new PdfJsRasterizer(pdfjs);
  } catch {
    return null;
  }
}
