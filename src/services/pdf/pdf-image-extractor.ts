interface PdfOperatorListLike {
  fnArray: number[];
  argsArray: unknown[][];
}

interface PdfObjectsLike {
  get(objId: string, callback?: (value: unknown) => void): unknown;
}

interface PdfPageLike {
  getOperatorList(): Promise<PdfOperatorListLike>;
  objs: PdfObjectsLike;
  view?: [number, number, number, number];
}

interface PdfDocumentLike {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfPageLike>;
}

interface PdfJsLike {
  getDocument(params: { data: ArrayBuffer; disableWorker: boolean; verbosity?: number; isOffscreenCanvasSupported?: boolean }): { promise: Promise<PdfDocumentLike> };
  GlobalWorkerOptions?: { workerSrc?: string };
  VerbosityLevel?: { ERRORS?: number };
  OPS?: {
    save?: number;
    restore?: number;
    transform?: number;
    paintImageXObject?: number;
    paintInlineImageXObject?: number;
    paintImageXObjectRepeat?: number;
    paintInlineImageXObjectGroup?: number;
  };
}

interface BinaryImageDataLike {
  width: number;
  height: number;
  data?: Uint8ClampedArray | Uint8Array;
  kind?: number;
  bitmap?: ImageBitmap;
}

interface CanvasLike {
  width: number;
  height: number;
  getContext(contextId: '2d'): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;
  convertToBlob?: (options?: { type?: string; quality?: number }) => Promise<Blob>;
  toBlob?: (callback: (blob: Blob | null) => void, type?: string, quality?: number) => void;
}

interface CanvasFactoryLike {
  create(width: number, height: number): CanvasLike | null;
}

export interface ExtractPdfImagesOptions {
  format?: 'png' | 'jpeg';
  jpegQuality?: number;
  minWidth?: number;
  minHeight?: number;
  includeInlineImages?: boolean;
  dedupe?: boolean;
  selectedCandidates?: Array<{ pageNumber: number; candidateId: string }>;
  pageNumbers?: number[];
}

export interface PdfImageCandidate {
  id: string;
  pageNumber: number;
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  pixelWidth: number;
  pixelHeight: number;
  source: 'xobject' | 'inline';
}

export interface ExtractedPdfImage {
  pageNumber: number;
  indexOnPage: number;
  width: number;
  height: number;
  blob: Blob;
  fileName: string;
  source: 'xobject' | 'inline';
}

const RGB_24_BPP = 2;
const RGBA_32_BPP = 3;
const DEFAULT_OPTIONS: Required<ExtractPdfImagesOptions> = {
  format: 'png',
  jpegQuality: 0.92,
  minWidth: 32,
  minHeight: 32,
  includeInlineImages: true,
  dedupe: true,
  selectedCandidates: [],
  pageNumbers: [],
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeOptions(options?: ExtractPdfImagesOptions): Required<ExtractPdfImagesOptions> {
  return {
    format: options?.format === 'jpeg' ? 'jpeg' : 'png',
    jpegQuality: clamp(Number(options?.jpegQuality ?? DEFAULT_OPTIONS.jpegQuality), 0.3, 1),
    minWidth: Math.max(1, Math.round(Number(options?.minWidth ?? DEFAULT_OPTIONS.minWidth))),
    minHeight: Math.max(1, Math.round(Number(options?.minHeight ?? DEFAULT_OPTIONS.minHeight))),
    includeInlineImages: options?.includeInlineImages !== false,
    dedupe: options?.dedupe !== false,
    selectedCandidates: Array.isArray(options?.selectedCandidates) ? options.selectedCandidates : [],
    pageNumbers: Array.isArray(options?.pageNumbers) ? options.pageNumbers.filter((value): value is number => typeof value === 'number' && Number.isFinite(value)) : [],
  };
}

function sanitizeBaseName(name: string): string {
  const trimmed = name.trim().replace(/\.[a-z0-9]+$/iu, '');
  const safe = trimmed.replace(/[^a-z0-9-_]+/giu, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
  return safe || 'document';
}

function buildFileName(baseName: string, pageNumber: number, indexOnPage: number, format: 'png' | 'jpeg'): string {
  const extension = format === 'jpeg' ? 'jpg' : 'png';
  return `${sanitizeBaseName(baseName)}-page-${pageNumber}-image-${indexOnPage}.${extension}`;
}

function multiplyTransform(left: number[], right: number[]): number[] {
  return [
    left[0]! * right[0]! + left[2]! * right[1]!,
    left[1]! * right[0]! + left[3]! * right[1]!,
    left[0]! * right[2]! + left[2]! * right[3]!,
    left[1]! * right[2]! + left[3]! * right[3]!,
    left[0]! * right[4]! + left[2]! * right[5]! + left[4]!,
    left[1]! * right[4]! + left[3]! * right[5]! + left[5]!,
  ];
}

function transformPoint(transform: number[], x: number, y: number): { x: number; y: number } {
  return {
    x: transform[0]! * x + transform[2]! * y + transform[4]!,
    y: transform[1]! * x + transform[3]! * y + transform[5]!,
  };
}

function getBoundsForUnitSquare(transform: number[]): { minX: number; maxX: number; minY: number; maxY: number } {
  const corners = [
    transformPoint(transform, 0, 0),
    transformPoint(transform, 1, 0),
    transformPoint(transform, 0, 1),
    transformPoint(transform, 1, 1),
  ];
  return {
    minX: Math.min(...corners.map((item) => item.x)),
    maxX: Math.max(...corners.map((item) => item.x)),
    minY: Math.min(...corners.map((item) => item.y)),
    maxY: Math.max(...corners.map((item) => item.y)),
  };
}

function createDefaultCanvasFactory(): CanvasFactoryLike {
  return {
    create(width: number, height: number): CanvasLike | null {
      if (typeof OffscreenCanvas !== 'undefined') {
        return new OffscreenCanvas(width, height) as unknown as CanvasLike;
      }
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas as unknown as CanvasLike;
      }
      return null;
    },
  };
}

async function loadPdfJs(): Promise<PdfJsLike | null> {
  try {
    const pdfjs = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as unknown as PdfJsLike;
    if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
      try {
        const workerSrcMod = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')) as { default?: string };
        if (workerSrcMod.default) {
          pdfjs.GlobalWorkerOptions.workerSrc = workerSrcMod.default;
        }
      } catch {
        // Worker URL is optional when disableWorker is true.
      }
    }
    return pdfjs;
  } catch {
    return null;
  }
}

function waitForPdfObject(objects: PdfObjectsLike, objId: string): Promise<unknown | null> {
  return new Promise((resolve) => {
    try {
      const immediate = objects.get(objId);
      if (immediate) {
        resolve(immediate);
        return;
      }
    } catch {
      // Wait for callback path below.
    }

    let settled = false;
    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, 350);

    try {
      objects.get(objId, (value: unknown) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeoutId);
        resolve(value);
      });
    } catch (error) {
      if (!settled) {
        settled = true;
        clearTimeout(timeoutId);
        resolve(null);
      }
    }
  });
}

function isRenderableImageData(value: unknown): value is BinaryImageDataLike {
  return Boolean(
    value
      && typeof value === 'object'
      && typeof (value as { width?: unknown }).width === 'number'
      && typeof (value as { height?: unknown }).height === 'number',
  );
}

function convertBinaryImageToRgba(image: BinaryImageDataLike): Uint8ClampedArray | null {
  if (!image.data) {
    return null;
  }
  const pixelCount = image.width * image.height;
  if (pixelCount <= 0) {
    return null;
  }

  if (image.kind === RGBA_32_BPP) {
    if (image.data instanceof Uint8ClampedArray) {
      return image.data;
    }
    return new Uint8ClampedArray(image.data);
  }

  if (image.kind === RGB_24_BPP || image.kind === undefined) {
    const source = image.data;
    const out = new Uint8ClampedArray(pixelCount * 4);
    let srcOffset = 0;
    let dstOffset = 0;
    while (srcOffset + 2 < source.length && dstOffset + 3 < out.length) {
      out[dstOffset] = source[srcOffset];
      out[dstOffset + 1] = source[srcOffset + 1];
      out[dstOffset + 2] = source[srcOffset + 2];
      out[dstOffset + 3] = 255;
      srcOffset += 3;
      dstOffset += 4;
    }
    return out;
  }

  return null;
}

async function canvasToBlob(canvas: CanvasLike, format: 'png' | 'jpeg', jpegQuality: number): Promise<Blob> {
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  if (typeof canvas.convertToBlob === 'function') {
    return canvas.convertToBlob({ type: mimeType, quality: jpegQuality });
  }
  if (typeof canvas.toBlob === 'function') {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob?.((blob) => {
        if (!blob) {
          reject(new Error('Failed to encode extracted image'));
          return;
        }
        resolve(blob);
      }, mimeType, jpegQuality);
    });
  }
  throw new Error('Canvas runtime cannot export blobs');
}

async function renderImageToBlob(
  image: BinaryImageDataLike,
  options: Required<ExtractPdfImagesOptions>,
  canvasFactory: CanvasFactoryLike,
): Promise<Blob> {
  const canvas = canvasFactory.create(image.width, image.height);
  if (!canvas) {
    throw new Error('Canvas environment is not available for image extraction');
  }
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to acquire 2d context for image extraction');
  }

  if (image.bitmap) {
    context.drawImage(image.bitmap, 0, 0);
    return canvasToBlob(canvas, options.format, options.jpegQuality);
  }

  const rgba = convertBinaryImageToRgba(image);
  if (!rgba) {
    throw new Error('Unsupported PDF image payload');
  }

  const imageData = typeof ImageData !== 'undefined'
    ? new ImageData(new Uint8ClampedArray(rgba), image.width, image.height)
    : (() => {
      const next = context.createImageData(image.width, image.height);
      next.data.set(rgba);
      return next;
    })();
  context.putImageData(imageData, 0, 0);
  return canvasToBlob(canvas, options.format, options.jpegQuality);
}

async function hashBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest)).map((item) => item.toString(16).padStart(2, '0')).join('');
  }
  const view = new Uint8Array(buffer);
  let hash = 2166136261;
  for (let index = 0; index < view.length; index += 1) {
    hash ^= view[index]!;
    hash = Math.imul(hash, 16777619);
  }
  return `fnv-${hash >>> 0}`;
}

type ExtractCandidate =
  | { source: 'xobject'; objId: string; transform: number[] }
  | { source: 'inline'; image: BinaryImageDataLike; transform: number[] };

function collectImageCandidates(
  operatorList: PdfOperatorListLike,
  includeInlineImages: boolean,
  ops: NonNullable<PdfJsLike['OPS']>,
): ExtractCandidate[] {
  const out: ExtractCandidate[] = [];
  const stack: number[][] = [];
  let currentTransform = [1, 0, 0, 1, 0, 0];
  for (let index = 0; index < operatorList.fnArray.length; index += 1) {
    const fn = operatorList.fnArray[index];
    const args = operatorList.argsArray[index] ?? [];
    if (fn === ops.save) {
      stack.push([...currentTransform]);
      continue;
    }
    if (fn === ops.restore) {
      currentTransform = stack.pop() ?? [1, 0, 0, 1, 0, 0];
      continue;
    }
    if (fn === ops.transform) {
      if (args.length >= 6 && args.every((value) => typeof value === 'number')) {
        currentTransform = multiplyTransform(currentTransform, args as number[]);
      }
      continue;
    }
    if (fn === ops.paintImageXObject || fn === ops.paintImageXObjectRepeat) {
      const objId = typeof args[0] === 'string' ? args[0] : null;
      if (objId) {
        out.push({ source: 'xobject', objId, transform: [...currentTransform] });
      }
      continue;
    }
    if (!includeInlineImages) {
      continue;
    }
    if (fn === ops.paintInlineImageXObject || fn === ops.paintInlineImageXObjectGroup) {
      const maybeImage = args[0];
      if (isRenderableImageData(maybeImage)) {
        out.push({ source: 'inline', image: maybeImage, transform: [...currentTransform] });
      }
    }
  }
  return out;
}

interface ResolvedPageImageCandidate {
  candidate: PdfImageCandidate;
  image: BinaryImageDataLike;
}

async function resolvePageCandidates(
  page: PdfPageLike,
  pageNumber: number,
  pageWidth: number,
  pageHeight: number,
  options: Required<ExtractPdfImagesOptions>,
  ops: NonNullable<PdfJsLike['OPS']>,
): Promise<ResolvedPageImageCandidate[]> {
  const operatorList = await page.getOperatorList();
  const candidates = collectImageCandidates(operatorList, options.includeInlineImages, ops);
  const out: ResolvedPageImageCandidate[] = [];
  let indexOnPage = 0;

  for (const candidate of candidates) {
    const raw = candidate.source === 'xobject'
      ? await waitForPdfObject(page.objs, candidate.objId)
      : candidate.image;

    if (!isRenderableImageData(raw)) {
      continue;
    }
    if (raw.width < options.minWidth || raw.height < options.minHeight) {
      continue;
    }

    const bounds = getBoundsForUnitSquare(candidate.transform);
    const widthRatio = Math.max(0, Math.min(1, (bounds.maxX - bounds.minX) / Math.max(1, pageWidth)));
    const heightRatio = Math.max(0, Math.min(1, (bounds.maxY - bounds.minY) / Math.max(1, pageHeight)));
    const xRatio = Math.max(0, Math.min(1, bounds.minX / Math.max(1, pageWidth)));
    const yRatio = Math.max(0, Math.min(1, (pageHeight - bounds.maxY) / Math.max(1, pageHeight)));
    if (widthRatio <= 0.0005 || heightRatio <= 0.0005) {
      continue;
    }

    indexOnPage += 1;
    out.push({
      candidate: {
        id: `page-${pageNumber}-image-${indexOnPage}`,
        pageNumber,
        xRatio,
        yRatio,
        widthRatio,
        heightRatio,
        pixelWidth: raw.width,
        pixelHeight: raw.height,
        source: candidate.source,
      },
      image: raw,
    });
  }

  return out;
}

export async function scanPdfImageCandidatesFromBlob(
  pdfBlob: Blob,
  options?: Omit<ExtractPdfImagesOptions, 'format' | 'jpegQuality' | 'dedupe' | 'selectedCandidates'>,
  deps?: {
    pdfjs?: PdfJsLike | null;
  },
): Promise<PdfImageCandidate[]> {
  const normalized = normalizeOptions(options);
  const pdfjs = deps?.pdfjs ?? await loadPdfJs();
  if (!pdfjs?.OPS) {
    throw new Error('PDF image extraction is unavailable in this runtime');
  }

  const bytes = await pdfBlob.arrayBuffer();
  const loadingTask = pdfjs.getDocument({
    data: bytes,
    disableWorker: true,
    verbosity: pdfjs.VerbosityLevel?.ERRORS ?? 0,
    isOffscreenCanvasSupported: typeof OffscreenCanvas !== 'undefined',
  });
  const documentRef = await loadingTask.promise;
  const requestedPages = normalized.pageNumbers.length > 0
    ? new Set(normalized.pageNumbers.filter((pageNumber) => pageNumber >= 1 && pageNumber <= documentRef.numPages))
    : null;

  const out: PdfImageCandidate[] = [];
  for (let pageNumber = 1; pageNumber <= documentRef.numPages; pageNumber += 1) {
    if (requestedPages && !requestedPages.has(pageNumber)) {
      continue;
    }
    const page = await documentRef.getPage(pageNumber);
    const view = page.view ?? [0, 0, 1, 1];
    const pageWidth = Math.max(1, Math.abs(view[2] - view[0]));
    const pageHeight = Math.max(1, Math.abs(view[3] - view[1]));
    const candidates = await resolvePageCandidates(page, pageNumber, pageWidth, pageHeight, normalized, pdfjs.OPS);
    out.push(...candidates.map((item) => item.candidate));
  }
  return out;
}

export async function extractImagesFromPdfBlob(
  pdfBlob: Blob,
  baseName: string,
  options?: ExtractPdfImagesOptions,
  deps?: {
    pdfjs?: PdfJsLike | null;
    canvasFactory?: CanvasFactoryLike;
  },
): Promise<ExtractedPdfImage[]> {
  const normalized = normalizeOptions(options);
  const pdfjs = deps?.pdfjs ?? await loadPdfJs();
  if (!pdfjs?.OPS) {
    throw new Error('PDF image extraction is unavailable in this runtime');
  }

  const canvasFactory = deps?.canvasFactory ?? createDefaultCanvasFactory();
  const canvasProbe = canvasFactory.create(1, 1);
  if (!canvasProbe) {
    throw new Error('Canvas environment is not available for image extraction');
  }

  const bytes = await pdfBlob.arrayBuffer();
  const loadingTask = pdfjs.getDocument({
    data: bytes,
    disableWorker: true,
    verbosity: pdfjs.VerbosityLevel?.ERRORS ?? 0,
    isOffscreenCanvasSupported: typeof OffscreenCanvas !== 'undefined',
  });
  const documentRef = await loadingTask.promise;

  const results: ExtractedPdfImage[] = [];
  const seenHashes = new Set<string>();
  const selectedCandidateSet = normalized.selectedCandidates.length > 0
    ? new Set(normalized.selectedCandidates.map((item) => `${item.pageNumber}:${item.candidateId}`))
    : null;
  const requestedPages = normalized.pageNumbers.length > 0
    ? new Set(normalized.pageNumbers.filter((pageNumber) => pageNumber >= 1 && pageNumber <= documentRef.numPages))
    : null;

  for (let pageNumber = 1; pageNumber <= documentRef.numPages; pageNumber += 1) {
    if (requestedPages && !requestedPages.has(pageNumber)) {
      continue;
    }
    const page = await documentRef.getPage(pageNumber);
    const view = page.view ?? [0, 0, 1, 1];
    const pageWidth = Math.max(1, Math.abs(view[2] - view[0]));
    const pageHeight = Math.max(1, Math.abs(view[3] - view[1]));
    const candidates = await resolvePageCandidates(page, pageNumber, pageWidth, pageHeight, normalized, pdfjs.OPS);
    let indexOnPage = 0;

    for (const candidate of candidates) {
      if (selectedCandidateSet && !selectedCandidateSet.has(`${pageNumber}:${candidate.candidate.id}`)) {
        continue;
      }

      const blob = await renderImageToBlob(candidate.image, normalized, canvasFactory);
      if (normalized.dedupe) {
        const hash = await hashBlob(blob);
        if (seenHashes.has(hash)) {
          continue;
        }
        seenHashes.add(hash);
      }

      indexOnPage += 1;
      results.push({
        pageNumber,
        indexOnPage,
        width: candidate.image.width,
        height: candidate.image.height,
        blob,
        fileName: buildFileName(baseName, pageNumber, indexOnPage, normalized.format),
        source: candidate.candidate.source,
      });
    }
  }

  return results;
}
