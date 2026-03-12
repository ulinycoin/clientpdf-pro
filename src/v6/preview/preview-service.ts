import type { PlatformRuntime } from '../../app/platform/create-platform';
import type { IWorkerCommand } from '../../core/public/contracts';

type PreviewKind = 'pdf' | 'image' | 'file';

export interface FilePreview {
  fileId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  kind: PreviewKind;
  thumbnailUrl: string | null;
  pageCount?: number;
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

function detectKind(mimeType: string): PreviewKind {
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  return 'file';
}

function createObjectUrl(blob: Blob): string | null {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return null;
  }
  return URL.createObjectURL(blob);
}

function safeRevokeObjectUrl(url: string | null): void {
  if (!url) {
    return;
  }
  if (typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') {
    return;
  }
  URL.revokeObjectURL(url);
}

let pdfJsPromise: Promise<PdfJsLike | null> | null = null;

function createPdfCanvasFactory() {
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

async function loadPdfJs(): Promise<PdfJsLike | null> {
  if (!pdfJsPromise) {
    pdfJsPromise = (async () => {
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
        return pdfjs;
      } catch {
        return null;
      }
    })();
  }
  return pdfJsPromise;
}

async function rasterizePdfPage(
  pdfBytes: ArrayBuffer,
  page: number,
  scale = 1.15,
  signal?: AbortSignal,
): Promise<{ blob: Blob | null; pageCount: number | undefined }> {
  if (signal?.aborted) {
    throw new Error('Preview generation aborted');
  }

  const pdfjs = await loadPdfJs();
  if (!pdfjs) {
    return { blob: null, pageCount: undefined };
  }

  const errorOnlyVerbosity = pdfjs.VerbosityLevel?.ERRORS ?? 0;
  const loadingTask = pdfjs.getDocument({ data: pdfBytes, disableWorker: true, verbosity: errorOnlyVerbosity });
  const pdf = await loadingTask.promise;
  const safePage = Math.min(Math.max(1, page), Math.max(1, pdf.numPages));
  const pdfPage = await pdf.getPage(safePage);
  const viewport = pdfPage.getViewport({ scale });

  const canvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(viewport.width, viewport.height)
      : typeof document !== 'undefined'
        ? document.createElement('canvas')
        : null;

  if (!canvas) {
    return { blob: null, pageCount: pdf.numPages };
  }

  if (typeof HTMLCanvasElement !== 'undefined' && canvas instanceof HTMLCanvasElement) {
    canvas.width = viewport.width;
    canvas.height = viewport.height;
  }

  const context = canvas.getContext('2d');
  if (!context) {
    return { blob: null, pageCount: pdf.numPages };
  }

  await pdfPage.render({
    canvasContext: context,
    viewport,
    annotationMode: 0,
    canvasFactory: createPdfCanvasFactory(),
  }).promise;
  if (signal?.aborted) {
    throw new Error('Preview generation aborted');
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
      canvas.convertToBlob({ type: 'image/png' }).then(resolve).catch(() => resolve(null));
    } else if (typeof HTMLCanvasElement !== 'undefined' && canvas instanceof HTMLCanvasElement) {
      (canvas as HTMLCanvasElement).toBlob(resolve, 'image/png');
    } else {
      resolve(null);
    }
  });

  return { blob, pageCount: pdf.numPages };
}

async function queryPdfPageCount(runtime: PlatformRuntime, fileId: string, signal?: AbortSignal): Promise<number | undefined> {
  if (signal?.aborted) {
    return undefined;
  }
  const command: IWorkerCommand = {
    id: crypto.randomUUID(),
    type: 'COMMAND',
    payload: {
      type: 'GET_PDF_PAGE_COUNT',
      payload: { fileId },
    },
  };

  try {
    const finalEvent = await runtime.workerOrchestrator.dispatch(command, undefined, signal);
    if (finalEvent.payload.type === 'PAGE_COUNT_RESULT') {
      return finalEvent.payload.payload.pageCount;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export class FilePreviewService {
  private readonly cache = new Map<string, FilePreview>();
  private readonly pageThumbCache = new Map<string, string | null>();

  constructor(
    private readonly maxEntries = 20,
    private readonly maxPageThumbEntries = 80,
  ) {}

  async getPreview(runtime: PlatformRuntime, fileId: string, signal?: AbortSignal): Promise<FilePreview> {
    const cached = this.cache.get(fileId);
    if (cached) {
      this.touch(fileId, cached);
      return cached;
    }

    const entry = await runtime.vfs.read(fileId);
    if (signal?.aborted) {
      throw new Error('Preview generation aborted');
    }

    const [blob, mimeType, sizeBytes] = await Promise.all([entry.getBlob(), entry.getType(), entry.getSize()]);
    if (signal?.aborted) {
      throw new Error('Preview generation aborted');
    }

    const kind = detectKind(mimeType);
    let thumbnailUrl: string | null = null;
    let pageCount: number | undefined;

    if (kind === 'image') {
      thumbnailUrl = createObjectUrl(blob);
    } else if (kind === 'pdf') {
      const arrayBuffer = await blob.arrayBuffer();
      const firstPage = await rasterizePdfPage(arrayBuffer, 1, 1.15, signal);
      pageCount = firstPage.pageCount;
      if (pageCount === undefined) {
        pageCount = await queryPdfPageCount(runtime, fileId, signal);
      }
      thumbnailUrl = firstPage.blob ? createObjectUrl(firstPage.blob) : null;
    }

    const preview: FilePreview = {
      fileId,
      name: entry.getName(),
      mimeType,
      sizeBytes,
      kind,
      thumbnailUrl,
      pageCount,
    };

    this.touch(fileId, preview);
    this.evictIfNeeded();
    return preview;
  }

  clear(): void {
    for (const value of this.cache.values()) {
      safeRevokeObjectUrl(value.thumbnailUrl);
    }
    this.cache.clear();
    for (const value of this.pageThumbCache.values()) {
      safeRevokeObjectUrl(value);
    }
    this.pageThumbCache.clear();
  }

  private touch(fileId: string, preview: FilePreview): void {
    this.cache.delete(fileId);
    this.cache.set(fileId, preview);
  }

  private evictIfNeeded(): void {
    while (this.cache.size > this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (!oldestKey) {
        return;
      }
      const oldest = this.cache.get(oldestKey);
      safeRevokeObjectUrl(oldest?.thumbnailUrl ?? null);
      this.cache.delete(oldestKey);
    }
  }

  async getPdfPagePreview(
    runtime: PlatformRuntime,
    fileId: string,
    page: number,
    options?: { scale?: number },
    signal?: AbortSignal,
  ): Promise<{ thumbnailUrl: string | null; pageCount?: number }> {
    const scale = options?.scale ?? 1.15;
    const key = `${fileId}::${page}::${scale}`;
    const cached = this.pageThumbCache.get(key);
    if (cached !== undefined) {
      this.pageThumbCache.delete(key);
      this.pageThumbCache.set(key, cached);
      const cachedPreview = this.cache.get(fileId);
      return {
        thumbnailUrl: cached,
        pageCount: cachedPreview?.pageCount,
      };
    }

    const entry = await runtime.vfs.read(fileId);
    const blob = await entry.getBlob();
    const mimeType = await entry.getType();
    if (mimeType !== 'application/pdf') {
      return { thumbnailUrl: null };
    }

    const arrayBuffer = await blob.arrayBuffer();
    const rendered = await rasterizePdfPage(arrayBuffer, page, scale, signal);
    const thumbnailUrl = rendered.blob ? createObjectUrl(rendered.blob) : null;
    this.pageThumbCache.set(key, thumbnailUrl);
    if (rendered.pageCount !== undefined) {
      const cachedPreview = this.cache.get(fileId);
      if (cachedPreview) {
        cachedPreview.pageCount = rendered.pageCount;
        this.touch(fileId, cachedPreview);
      }
    }
    this.evictPageThumbIfNeeded();
    return {
      thumbnailUrl,
      pageCount: rendered.pageCount,
    };
  }

  private evictPageThumbIfNeeded(): void {
    while (this.pageThumbCache.size > this.maxPageThumbEntries) {
      const oldestKey = this.pageThumbCache.keys().next().value;
      if (!oldestKey) {
        return;
      }
      const oldest = this.pageThumbCache.get(oldestKey) ?? null;
      safeRevokeObjectUrl(oldest);
      this.pageThumbCache.delete(oldestKey);
    }
  }
}

export const defaultFilePreviewService = new FilePreviewService();
