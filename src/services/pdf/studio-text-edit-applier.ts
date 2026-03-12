import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { WorkerStudioEditElement, WorkerStudioFontFamilyId } from '../../core/types/contracts';
import { parsePdfTextOperators } from './pdf-content-stream-parser';

let pdfCorePromise: Promise<{ decodePDFRawStream?: (stream: unknown) => { decode: () => Uint8Array } } | null> | null = null;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sanitizeInlineText(value: string): string {
  return value.replace(/\0/g, '').replace(/[\r\n]+/gu, ' ');
}

function measureTextWidthWithTracking(font: PDFFont, text: string, fontSize: number, tracking: number): number {
  if (!text) {
    return 0;
  }
  return font.widthOfTextAtSize(text, fontSize) + tracking * Math.max(0, text.length - 1);
}

function fitTextToWidth(
  font: PDFFont,
  text: string,
  targetWidth: number,
  preferredFontSize: number,
  preferredTracking: number,
  minFontSize = 8,
): { fontSize: number; tracking: number; overflow: boolean } {
  const safeText = text || ' ';
  let fontSize = preferredFontSize;
  let tracking = preferredTracking;

  const fitAtSize = (size: number) => {
    const baseWidth = measureTextWidthWithTracking(font, safeText, size, preferredTracking);
    // Use 2% tolerance to match client-side calculation
    const effectiveTargetWidth = targetWidth * 1.02;
    if (baseWidth <= effectiveTargetWidth || safeText.length <= 1) {
      return { size, tracking: preferredTracking, width: baseWidth };
    }
    const minTracking = -0.05 * size;
    const neededTracking = (effectiveTargetWidth - baseWidth) / (safeText.length - 1);
    const nextTracking = preferredTracking + clamp(neededTracking, minTracking, 0);
    const width = measureTextWidthWithTracking(font, safeText, size, nextTracking);
    return { size, tracking: nextTracking, width };
  };

  let fitted = fitAtSize(fontSize);
  const effectiveTargetWidth = targetWidth * 1.02;
  while (fitted.width > effectiveTargetWidth && fontSize > minFontSize) {
    fontSize = Math.max(minFontSize, fontSize - 0.5);
    fitted = fitAtSize(fontSize);
  }

  tracking = fitted.tracking;

  return {
    fontSize,
    tracking,
    overflow: fitted.width > targetWidth,
  };
}

function hexToRgb(color: string): { r: number; g: number; b: number } {
  const normalized = color.replace('#', '').trim();
  const safe = normalized.length === 3
    ? normalized
      .split('')
      .map((ch) => ch + ch)
      .join('')
    : normalized.padEnd(6, '0').slice(0, 6);
  const intValue = Number.parseInt(safe, 16);
  if (Number.isNaN(intValue)) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: ((intValue >> 16) & 255) / 255,
    g: ((intValue >> 8) & 255) / 255,
    b: (intValue & 255) / 255,
  };
}

function getPdfFontName(
  fontFamily: WorkerStudioFontFamilyId,
  fontWeight: 'normal' | 'bold',
  fontStyle: 'normal' | 'italic',
) {
  if (fontFamily === 'times') {
    if (fontWeight === 'bold' && fontStyle === 'italic') {
      return StandardFonts.TimesRomanBoldItalic;
    }
    if (fontWeight === 'bold') {
      return StandardFonts.TimesRomanBold;
    }
    if (fontStyle === 'italic') {
      return StandardFonts.TimesRomanItalic;
    }
    return StandardFonts.TimesRoman;
  }

  if (fontFamily === 'mono') {
    if (fontWeight === 'bold') {
      return StandardFonts.CourierBold;
    }
    return StandardFonts.Courier;
  }

  if (fontWeight === 'bold' && fontStyle === 'italic') {
    return StandardFonts.HelveticaBoldOblique;
  }
  if (fontWeight === 'bold') {
    return StandardFonts.HelveticaBold;
  }
  if (fontStyle === 'italic') {
    return StandardFonts.HelveticaOblique;
  }
  return StandardFonts.Helvetica;
}

function escapePdfLiteralString(input: string): string {
  return input
    .replace(/\\/gu, '\\\\')
    .replace(/\(/gu, '\\(')
    .replace(/\)/gu, '\\)')
    .replace(/\r/gu, '\\r')
    .replace(/\n/gu, '\\n');
}

function canEncodeAsLatin1(input: string): boolean {
  for (let i = 0; i < input.length; i += 1) {
    if (input.charCodeAt(i) > 0xff) {
      return false;
    }
  }
  return true;
}

function containsArabic(input: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/u.test(input);
}

function containsCyrillic(input: string): boolean {
  return /\p{Script=Cyrillic}/u.test(input);
}

function containsCjk(input: string): boolean {
  return /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uAC00-\uD7AF]/u.test(input);
}

function containsDevanagari(input: string): boolean {
  return /[\u0900-\u097F]/u.test(input);
}

function replaceUnsupportedChars(input: string): string {
  return input.replace(/[^\u0000-\u00FF]/gu, '?');
}

function canFontEncodeText(font: PDFFont, text: string): boolean {
  try {
    font.encodeText(text || ' ');
    return true;
  } catch {
    return false;
  }
}

function isAutoWhiteoutRect(element: WorkerStudioEditElement): boolean {
  if (element.type !== 'rect') {
    return false;
  }
  const fill = String(element.fill || '').trim().toLowerCase();
  const stroke = String(element.stroke || '').trim().toLowerCase();
  return (
    (fill === '#ffffff' || fill === '#fff')
    && (stroke === 'transparent' || stroke === '#000000' || stroke === '#ffffff' || stroke === '#fff')
    && (element.strokeWidth ?? 0) <= 0.001
    && (element.opacity ?? 1) >= 0.99
  );
}

function encodeLatin1(input: string): Uint8Array {
  const bytes = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i += 1) {
    bytes[i] = input.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function dataUrlToBytes(dataUrl: string): { mimeType: string; bytes: Uint8Array } | null {
  const match = /^data:(image\/(?:png|jpeg|jpg));base64,([a-z0-9+/=]+)$/iu.exec(dataUrl.trim());
  if (!match) {
    return null;
  }
  const mimeType = match[1]!.toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1]!.toLowerCase();
  const base64 = match[2]!;
  try {
    const decoded = atob(base64);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i += 1) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return { mimeType, bytes };
  } catch {
    return null;
  }
}

async function decodePageStreamToLatin1(contentStream: unknown): Promise<string | null> {
  if (
    !contentStream
    || typeof contentStream !== 'object'
    || typeof (contentStream as { getContents?: unknown }).getContents !== 'function'
  ) {
    return null;
  }

  if (typeof (contentStream as { getUnencodedContents?: unknown }).getUnencodedContents === 'function') {
    const bytes = (contentStream as { getUnencodedContents: () => Uint8Array }).getUnencodedContents();
    return new TextDecoder('latin1').decode(bytes);
  }

  if (!pdfCorePromise) {
    pdfCorePromise = Promise.race([
      import('pdf-lib/es/core/index.js')
        .then((module) => {
          const maybeCore = (module as { default?: { decodePDFRawStream?: (stream: unknown) => { decode: () => Uint8Array } } }).default;
          return maybeCore ?? null;
        })
        .catch(() => null),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 300);
      }),
    ]);
  }
  const core = await pdfCorePromise;
  if (core?.decodePDFRawStream) {
    try {
      const decoded = core.decodePDFRawStream(contentStream);
      if (decoded && typeof decoded.decode === 'function') {
        return new TextDecoder('latin1').decode(decoded.decode());
      }
    } catch {
      // Fallback to raw decode paths.
    }
  }

  const rawBytes = (contentStream as { getContents: () => Uint8Array }).getContents();
  const direct = new TextDecoder('latin1').decode(rawBytes);
  if (/\b(Tj|TJ)\b/u.test(direct)) {
    return direct;
  }
  if (typeof DecompressionStream === 'undefined') {
    return '';
  }
  const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('DECOMPRESS_TIMEOUT')), timeoutMs);
        }),
      ]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };
  for (const format of ['deflate', 'deflate-raw'] as const) {
    try {
      const inflated = await withTimeout((async () => {
        const stream = new DecompressionStream(format);
        const writer = stream.writable.getWriter();
        const safeBytes = new Uint8Array(rawBytes.byteLength);
        safeBytes.set(rawBytes);
        await writer.write(safeBytes);
        await writer.close();
        return new Uint8Array(await new Response(stream.readable).arrayBuffer());
      })(), 250);
      const decoded = new TextDecoder('latin1').decode(inflated);
      if (/\b(Tj|TJ)\b/u.test(decoded)) {
        return decoded;
      }
    } catch {
      // Try next format.
    }
  }
  return '';
}

function selectOperatorCandidateByPosition(params: {
  candidates: Array<{ streamIndex: number; operator: ReturnType<typeof parsePdfTextOperators>[number] }>;
  pageWidth: number;
  pageHeight: number;
  targetXRatio: number;
  targetYRatio: number;
  targetWidthRatio: number;
  targetHeightRatio: number;
  targetTextAlign: 'left' | 'center' | 'right';
  targetText: string;
}): { streamIndex: number; operator: ReturnType<typeof parsePdfTextOperators>[number] } | null {
  const {
    candidates,
    pageWidth,
    pageHeight,
    targetXRatio,
    targetYRatio,
    targetWidthRatio,
    targetHeightRatio,
    targetTextAlign,
    targetText,
  } = params;
  if (candidates.length === 0) {
    return null;
  }

  const selectLexicalCandidate = () => {
    const targetTokens = targetText
      .toLowerCase()
      .split(/\s+/u)
      .map((token) => token.trim())
      .filter(Boolean);
    if (targetTokens.length === 0) {
      return null;
    }
    const lexical = candidates
      .map((candidate) => {
        const sourceText = candidate.operator.textSegments.join(' ').toLowerCase();
        const overlap = targetTokens.filter((token) => sourceText.includes(token)).length;
        const score = overlap / targetTokens.length;
        return { candidate, score };
      })
      .sort((left, right) => right.score - left.score);
    const bestLexical = lexical[0];
    const secondLexical = lexical[1];
    if (!bestLexical || bestLexical.score <= 0) {
      return null;
    }
    if (secondLexical && bestLexical.score - secondLexical.score < 0.25) {
      return null;
    }
    return bestLexical.candidate;
  };

  const targetLeftX = targetXRatio * pageWidth;
  const targetWidth = targetWidthRatio * pageWidth;
  const targetX = targetTextAlign === 'center'
    ? targetLeftX + targetWidth / 2
    : targetTextAlign === 'right'
      ? targetLeftX + targetWidth
      : targetLeftX;
  const targetY = pageHeight - ((targetYRatio + targetHeightRatio * 0.5) * pageHeight);

  const scored = candidates
    .filter((candidate) => Number.isFinite(candidate.operator.textMatrixX) && Number.isFinite(candidate.operator.textMatrixY))
    .map((candidate) => {
      const dx = (candidate.operator.textMatrixX as number) - targetX;
      const dy = (candidate.operator.textMatrixY as number) - targetY;
      const normDx = Math.abs(dx) / Math.max(1, pageWidth);
      const normDy = Math.abs(dy) / Math.max(1, pageHeight);
      const posScore = Math.hypot(normDx, normDy);
      const sourceText = candidate.operator.textSegments.join('');
      const estimatedWidth = Math.max(
        0,
        sourceText.length * Math.max(4, candidate.operator.fontSize ?? 12) * 0.5,
      );
      const widthScore = Math.abs(estimatedWidth - targetWidth) / Math.max(1, targetWidth);
      // Width mismatch is a weak signal: user edit boxes are often wider than source glyph runs.
      const score = posScore + Math.min(0.08, widthScore * 0.05);
      return {
        candidate,
        score,
        normDx,
        normDy,
        widthScore,
      };
    })
    .sort((left, right) => (
      left.score - right.score
      || left.normDy - right.normDy
      || left.normDx - right.normDx
      || left.widthScore - right.widthScore
      || left.candidate.streamIndex - right.candidate.streamIndex
      || left.candidate.operator.start - right.candidate.operator.start
    ));

  if (scored.length === 0) {
    return selectLexicalCandidate();
  }

  const best = scored[0];
  const second = scored[1];
  if (!best) {
    return null;
  }
  if (best.score > 0.08) {
    return selectLexicalCandidate();
  }
  if (
    second
    && second.score < 0.06
    && second.score - best.score < 0.01
    && Math.abs(second.normDy - best.normDy) < 0.002
    && Math.abs(second.normDx - best.normDx) < 0.002
    && Math.abs(second.widthScore - best.widthScore) < 0.05
  ) {
    return null;
  }
  return best.candidate;
}

async function tryApplyTrueReplaceSingleTextOperator(params: {
  pdf: PDFDocument;
  pageIndex: number;
  text: string;
  targetXRatio: number;
  targetYRatio: number;
  targetWidthRatio: number;
  targetHeightRatio: number;
  targetTextAlign: 'left' | 'center' | 'right';
  pageWidth: number;
  pageHeight: number;
}): Promise<{ applied: boolean; reason?: string }> {
  const { pdf, pageIndex, text } = params;
  if (!canEncodeAsLatin1(text)) {
    return { applied: false, reason: 'NON_LATIN1_TEXT' };
  }

  const page = pdf.getPage(pageIndex);
  const { PDFName } = await import('pdf-lib');
  const contentsRef = page.node.get(PDFName.of('Contents'));
  if (!contentsRef) {
    return { applied: false, reason: 'CONTENTS_MISSING' };
  }
  const resolved = pdf.context.lookup(contentsRef as any) as any;
  const streamEntries: Array<{ stream: any; index: number }> = [];
  if (resolved && typeof resolved.size === 'function' && typeof resolved.get === 'function') {
    const count = Number(resolved.size());
    for (let i = 0; i < count; i += 1) {
      streamEntries.push({ stream: pdf.context.lookup(resolved.get(i)), index: i });
    }
  } else {
    streamEntries.push({ stream: resolved, index: 0 });
  }
  if (streamEntries.length === 0) {
    return { applied: false, reason: 'CONTENTS_MISSING' };
  }

  const decodedByStream: Array<{ index: number; content: string; operators: ReturnType<typeof parsePdfTextOperators> }> = [];
  for (const entry of streamEntries) {
    const decodedContent = await decodePageStreamToLatin1(entry.stream);
    if (decodedContent === null) {
      continue;
    }
    decodedByStream.push({
      index: entry.index,
      content: decodedContent,
      operators: parsePdfTextOperators(decodedContent),
    });
  }
  if (decodedByStream.length === 0) {
    return { applied: false, reason: 'STREAM_DECODE_FAILED' };
  }

  const candidates = decodedByStream.flatMap((entry) => entry.operators.map((operator) => ({
    streamIndex: entry.index,
    operator,
  })));

  let target: { streamIndex: number; operator: ReturnType<typeof parsePdfTextOperators>[number] } | null = null;
  if (candidates.length === 1) {
    target = candidates[0] ?? null;
  } else if (candidates.length > 1) {
    target = selectOperatorCandidateByPosition({
      candidates,
      pageWidth: params.pageWidth,
      pageHeight: params.pageHeight,
      targetXRatio: params.targetXRatio,
      targetYRatio: params.targetYRatio,
      targetWidthRatio: params.targetWidthRatio,
      targetHeightRatio: params.targetHeightRatio,
      targetTextAlign: params.targetTextAlign,
      targetText: params.text,
    });
    if (!target) {
      return { applied: false, reason: 'AMBIGUOUS_TEXT_OPERATORS' };
    }
  } else {
    return { applied: false, reason: 'TEXT_OPERATOR_NOT_FOUND' };
  }

  if (!target || (target.operator.operator !== 'Tj' && target.operator.operator !== 'TJ')) {
    return { applied: false, reason: 'TEXT_OPERATOR_UNSUPPORTED' };
  }

  const streamTarget = decodedByStream.find((entry) => entry.index === target.streamIndex);
  if (!streamTarget) {
    return { applied: false, reason: 'STREAM_NOT_FOUND' };
  }

  const replacement = target.operator.operator === 'Tj'
    ? `(${escapePdfLiteralString(text)}) Tj`
    : `[(${escapePdfLiteralString(text)})] TJ`;
  const updatedContent = `${streamTarget.content.slice(0, target.operator.start)}${replacement}${streamTarget.content.slice(target.operator.end)}`;
  const updatedBytes = encodeLatin1(updatedContent);
  const updatedStream = pdf.context.flateStream(updatedBytes);
  const updatedRef = pdf.context.register(updatedStream);

  if (resolved && typeof resolved.size === 'function' && typeof resolved.set === 'function') {
    resolved.set(target.streamIndex, updatedRef);
  } else {
    page.node.set(PDFName.of('Contents'), updatedRef);
  }
  return { applied: true };
}

export async function applyStudioTextEditsToPdfBytes(params: {
  sourceBytes: Uint8Array;
  pageIndex: number;
  elements: WorkerStudioEditElement[];
}): Promise<{
  outputBytes: Uint8Array;
  overflowDetected: boolean;
  trueReplaceApplied: boolean;
  trueReplaceFallbackReason?: string;
}> {
  const pdf = await PDFDocument.load(params.sourceBytes);
  if (params.pageIndex < 0 || params.pageIndex >= pdf.getPageCount()) {
    throw new Error(`Page index out of range: ${params.pageIndex}`);
  }

  const page = pdf.getPage(params.pageIndex);
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  pdf.registerFontkit(fontkit);

  const fontCache = new Map<string, PDFFont>();
  const imageCache = new Map<string, Awaited<ReturnType<typeof pdf.embedPng>>>();
  const fontBytesCache = new Map<string, ArrayBuffer | null>();
  const toAbsoluteUrl = (path: string) => new URL(path, typeof location !== 'undefined' ? location.origin : 'http://localhost:4173').href;
  const fetchFontBytes = async (key: string, candidates: string[]) => {
    if (fontBytesCache.has(key)) {
      return fontBytesCache.get(key) ?? null;
    }
    for (const candidate of candidates) {
      try {
        const response = await fetch(toAbsoluteUrl(candidate));
        if (!response.ok) {
          continue;
        }
        const bytes = await response.arrayBuffer();
        fontBytesCache.set(key, bytes);
        return bytes;
      } catch {
        // Try next candidate.
      }
    }
    fontBytesCache.set(key, null);
    return null;
  };

  const getStandardFont = async (family: WorkerStudioFontFamilyId, weight: 'normal' | 'bold', style: 'normal' | 'italic') => {
    const fontName = getPdfFontName(family, weight, style);
    const key = String(fontName);
    const cached = fontCache.get(key);
    if (cached) {
      return cached;
    }
    const embedded = await pdf.embedFont(fontName);
    fontCache.set(key, embedded);
    return embedded;
  };

  const getEmbeddedFontFromFile = async (key: string, candidates: string[]): Promise<PDFFont | null> => {
    const cachedFont = fontCache.get(key);
    if (cachedFont) {
      return cachedFont;
    }
    const fontBytes = await fetchFontBytes(key, candidates);
    if (!fontBytes) {
      return null;
    }
    try {
      const embedded = await pdf.embedFont(fontBytes, { subset: true });
      fontCache.set(key, embedded);
      return embedded;
    } catch {
      return null;
    }
  };

  const getNotoSansDevanagariFont = async (): Promise<PDFFont | null> => {
    const key = 'noto-sans-devanagari-400';
    const cached = fontCache.get(key);
    if (cached) {
      return cached;
    }
    try {
      const module = await import('@fontsource/noto-sans/files/noto-sans-devanagari-400-normal.woff?url') as { default: string };
      const response = await fetch(module.default);
      if (!response.ok) {
        return null;
      }
      const bytes = await response.arrayBuffer();
      const embedded = await pdf.embedFont(bytes, { subset: true });
      fontCache.set(key, embedded);
      return embedded;
    } catch {
      return null;
    }
  };

  const getNotoSansCyrillicFont = async (): Promise<PDFFont | null> => {
    const key = 'noto-sans-cyrillic-400';
    const cached = fontCache.get(key);
    if (cached) {
      return cached;
    }
    try {
      const module = await import('@fontsource/noto-sans/files/noto-sans-cyrillic-ext-400-normal.woff?url') as { default: string };
      const response = await fetch(module.default);
      if (!response.ok) {
        return null;
      }
      const bytes = await response.arrayBuffer();
      const embedded = await pdf.embedFont(bytes, { subset: true });
      fontCache.set(key, embedded);
      return embedded;
    } catch {
      return null;
    }
  };

  const getNotoSansLatinFont = async (): Promise<PDFFont | null> => {
    const key = 'noto-sans-latin-400';
    const cached = fontCache.get(key);
    if (cached) {
      return cached;
    }
    try {
      const module = await import('@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff?url') as { default: string };
      const response = await fetch(module.default);
      if (!response.ok) {
        return null;
      }
      const bytes = await response.arrayBuffer();
      const embedded = await pdf.embedFont(bytes, { subset: true });
      fontCache.set(key, embedded);
      return embedded;
    } catch {
      return null;
    }
  };

  const getPreferredFontCandidates = async (
    family: WorkerStudioFontFamilyId,
    weight: 'normal' | 'bold',
    style: 'normal' | 'italic',
    text: string,
  ): Promise<PDFFont[]> => {
    const candidates: PDFFont[] = [];
    const addUnique = (font: PDFFont | null) => {
      if (font && !candidates.includes(font)) {
        candidates.push(font);
      }
    };

    if (family === 'roboto') {
      addUnique(await getEmbeddedFontFromFile('roboto-regular', ['/fonts/Roboto-Regular.ttf']));
    } else if (family === 'noto') {
      addUnique(await getNotoSansLatinFont());
    } else if (family === 'noto-arabic') {
      addUnique(await getEmbeddedFontFromFile('noto-arabic-regular', [
        '/fonts/NotoSansArabic-Regular.ttf',
        '/fonts/NotoNaskhArabic-Regular.ttf',
      ]));
    } else if (family === 'noto-cjk') {
      addUnique(await getEmbeddedFontFromFile('noto-cjk-regular', [
        '/fonts/NotoSansSC-Regular.otf',
        '/fonts/NotoSansSC-Regular.ttf',
        '/fonts/NotoSansJP-Regular.otf',
        '/fonts/NotoSansJP-Regular.ttf',
        '/fonts/NotoSansKR-Regular.otf',
        '/fonts/NotoSansKR-Regular.ttf',
      ]));
    } else if (family === 'noto-devanagari') {
      addUnique(await getNotoSansDevanagariFont());
    } else {
      addUnique(await getStandardFont(family, weight, style));
    }
    addUnique(await getNotoSansLatinFont());
    addUnique(await getEmbeddedFontFromFile('roboto-regular', ['/fonts/Roboto-Regular.ttf']));

    if (containsArabic(text) || family === 'noto-arabic') {
      addUnique(await getEmbeddedFontFromFile('noto-arabic-regular', [
        '/fonts/NotoSansArabic-Regular.ttf',
        '/fonts/NotoNaskhArabic-Regular.ttf',
      ]));
    }
    if (containsCjk(text) || family === 'noto-cjk') {
      addUnique(await getEmbeddedFontFromFile('noto-cjk-regular', [
        '/fonts/NotoSansSC-Regular.otf',
        '/fonts/NotoSansSC-Regular.ttf',
        '/fonts/NotoSansJP-Regular.otf',
        '/fonts/NotoSansJP-Regular.ttf',
        '/fonts/NotoSansKR-Regular.otf',
        '/fonts/NotoSansKR-Regular.ttf',
      ]));
    }
    if (containsDevanagari(text) || family === 'noto-devanagari') {
      addUnique(await getNotoSansDevanagariFont());
    }
    if (containsCyrillic(text)) {
      addUnique(await getNotoSansCyrillicFont());
    }

    addUnique(await getStandardFont('sora', 'normal', 'normal'));
    return candidates;
  };

  const resolveRenderableText = async (params: {
    family: WorkerStudioFontFamilyId;
    weight: 'normal' | 'bold';
    style: 'normal' | 'italic';
    text: string;
  }): Promise<{ font: PDFFont; text: string }> => {
    const candidates = await getPreferredFontCandidates(params.family, params.weight, params.style, params.text);
    for (const candidate of candidates) {
      if (canFontEncodeText(candidate, params.text)) {
        return { font: candidate, text: params.text };
      }
    }

    const latinSafeText = replaceUnsupportedChars(params.text) || ' ';
    for (const candidate of candidates) {
      if (canFontEncodeText(candidate, latinSafeText)) {
        return { font: candidate, text: latinSafeText };
      }
    }

    const fallback = await getStandardFont('sora', 'normal', 'normal');
    return { font: fallback, text: latinSafeText };
  };

  let overflowDetected = false;
  const textElements = params.elements.filter((element) => element.type === 'text');
  const consumedTextIds = new Set<string>();
  const usedFormFieldNames = new Set<string>();
  let formAppearanceFont: PDFFont | null = null;
  let trueReplaceApplied = false;
  let trueReplaceFallbackReason: string | undefined = 'INELIGIBLE_EDIT_PAYLOAD';

  const canAttemptSafeTrueReplace = textElements.length === 1
    && params.elements.every((element) => element.type === 'text' || isAutoWhiteoutRect(element));
  if (canAttemptSafeTrueReplace) {
    const target = textElements[0];
    const sanitizedText = sanitizeInlineText(target.text || ' ');
    const trueReplaceResult = await tryApplyTrueReplaceSingleTextOperator({
      pdf,
      pageIndex: params.pageIndex,
      text: sanitizedText,
      targetXRatio: target.x,
      targetYRatio: target.y,
      targetWidthRatio: target.w,
      targetHeightRatio: target.h,
      targetTextAlign: target.textAlign,
      pageWidth,
      pageHeight,
    });
    trueReplaceApplied = trueReplaceResult.applied;
    if (trueReplaceResult.applied) {
      consumedTextIds.add(target.id);
      trueReplaceFallbackReason = undefined;
    } else {
      trueReplaceFallbackReason = trueReplaceResult.reason ?? 'TRUE_REPLACE_FAILED';
    }
  }

  for (const element of params.elements) {
    if (element.type === 'text') {
      if (consumedTextIds.has(element.id)) {
        continue;
      }
      const line = sanitizeInlineText(element.text || ' ');
      const rendered = await resolveRenderableText({
        family: element.fontFamily,
        weight: element.fontWeight,
        style: element.fontStyle,
        text: line,
      });
      const font = rendered.font;
      const textToDraw = rendered.text || ' ';
      const { r, g, b } = hexToRgb(element.color);
      const blockWidth = element.w * pageWidth;
      const sourceDerivedFontSize = typeof element.sourceFontSizeRatio === 'number'
        ? clamp(element.sourceFontSizeRatio * pageHeight, 4, 144)
        : null;
      const hasExplicitFontSizeChange = sourceDerivedFontSize === null
        ? true
        : Math.abs(element.fontSize - sourceDerivedFontSize) > 0.35;
      const preferredFontSize = hasExplicitFontSizeChange
        ? element.fontSize
        : (sourceDerivedFontSize ?? element.fontSize);
      const fit = fitTextToWidth(font, textToDraw, blockWidth, preferredFontSize, element.letterSpacing ?? 0, 8);
      overflowDetected ||= fit.overflow;

      const lineWidth = font.widthOfTextAtSize(textToDraw, fit.fontSize) + fit.tracking * Math.max(0, textToDraw.length - 1);
      let x = element.x * pageWidth;
      if (element.textAlign === 'center') {
        x += Math.max(0, (blockWidth - lineWidth) / 2);
      }
      if (element.textAlign === 'right') {
        x += Math.max(0, blockWidth - lineWidth);
      }
      const yTop = element.y * pageHeight;
      // If we have the exact ascent from extraction, use it. Otherwise use 0.82 heuristic.
      const ascent = element.ascent ?? (fit.fontSize * 0.82);
      const y = pageHeight - yTop - ascent;

      // Use a small tolerance for tracking to avoid manual loop for floating point noise
      if (Math.abs(fit.tracking) < 0.001 || textToDraw.length <= 1) {
        page.drawText(textToDraw, {
          x,
          y,
          size: fit.fontSize,
          font,
          color: rgb(r, g, b),
          opacity: element.opacity,
        });
      } else {
        let cursor = x;
        for (let i = 0; i < textToDraw.length; i += 1) {
          const char = textToDraw[i]!;
          page.drawText(char, {
            x: cursor,
            y,
            size: fit.fontSize,
            font,
            color: rgb(r, g, b),
            opacity: element.opacity,
          });
          cursor += font.widthOfTextAtSize(char, fit.fontSize) + (i < textToDraw.length - 1 ? fit.tracking : 0);
        }
      }
      continue;
    }

    if (element.type === 'form-field') {
      const form = pdf.getForm();
      const sx = element.x * pageWidth;
      const sh = element.h * pageHeight;
      const sy = pageHeight - (element.y * pageHeight) - sh;
      const sw = element.w * pageWidth;
      const preferredName = (element.name || element.id).trim().slice(0, 120) || element.id;
      let fieldName = preferredName;
      if (usedFormFieldNames.has(fieldName)) {
        fieldName = `${preferredName}_${element.id.slice(0, 8)}`;
      }
      usedFormFieldNames.add(fieldName);

      try {
        const ensureFormAppearanceFont = async (): Promise<PDFFont> => {
          if (formAppearanceFont) {
            return formAppearanceFont;
          }
          formAppearanceFont = await pdf.embedFont(StandardFonts.Helvetica);
          return formAppearanceFont;
        };

        if (element.formType === 'text') {
          const field = form.createTextField(fieldName);
          field.addToPage(page, { x: sx, y: sy, width: sw, height: sh });
          field.setFontSize(clamp(element.fontSize || 12, 6, 72));
          field.defaultUpdateAppearances(await ensureFormAppearanceFont());
          if (element.defaultValue) {
            field.setText(element.defaultValue);
          }
          if (element.required) field.enableRequired();
        } else if (element.formType === 'multiline') {
          const field = form.createTextField(fieldName);
          field.addToPage(page, { x: sx, y: sy, width: sw, height: sh });
          field.enableMultiline();
          field.setFontSize(clamp(element.fontSize || 12, 6, 72));
          field.defaultUpdateAppearances(await ensureFormAppearanceFont());
          if (element.defaultValue) {
            field.setText(element.defaultValue);
          }
          if (element.required) field.enableRequired();
        } else if (element.formType === 'checkbox') {
          const cb = form.createCheckBox(fieldName);
          cb.addToPage(page, { x: sx, y: sy, width: sw, height: sh });
          if (element.defaultValue && element.defaultValue.toLowerCase() !== 'off') cb.check();
          if (element.required) cb.enableRequired();
        } else if (element.formType === 'radio') {
          // Fallback to a single-option radio group if ID represents a radio button
          try {
            const existing = form.getRadioGroup(fieldName);
            if (existing) {
              existing.addOptionToPage(`Opt_${crypto.randomUUID().slice(0, 4)}`, page, { x: sx, y: sy, width: sw, height: sh });
            } else {
              const rg = form.createRadioGroup(fieldName);
              rg.addOptionToPage('Choice1', page, { x: sx, y: sy, width: sw, height: sh });
              if (element.defaultValue && element.defaultValue.toLowerCase() !== 'off') rg.select('Choice1');
              if (element.required) rg.enableRequired();
            }
          } catch {
            const rg = form.createRadioGroup(fieldName);
            rg.addOptionToPage('Choice1', page, { x: sx, y: sy, width: sw, height: sh });
            if (element.defaultValue && element.defaultValue.toLowerCase() !== 'off') rg.select('Choice1');
            if (element.required) rg.enableRequired();
          }
        } else if (element.formType === 'dropdown') {
          const dropdown = form.createDropdown(fieldName);
          dropdown.addToPage(page, { x: sx, y: sy, width: sw, height: sh });
          const options = Array.isArray(element.options) && element.options.length > 0
            ? element.options
            : ['Option 1', 'Option 2', 'Option 3'];
          dropdown.addOptions(options);
          if (element.defaultValue && options.includes(element.defaultValue)) {
            dropdown.select(element.defaultValue);
          } else if (options.length > 0) {
            dropdown.select(options[0]!);
          }
          if (element.required) dropdown.enableRequired();
        }
      } catch (err) {
        // Silently ignore form creation failures for individual elements
      }
      continue;
    }

    if (element.type === 'watermark') {
      const line = sanitizeInlineText(element.text || ' ');
      const rendered = await resolveRenderableText({
        family: element.fontFamily,
        weight: element.fontWeight,
        style: element.fontStyle,
        text: line,
      });
      const font = rendered.font;
      const textToDraw = rendered.text || ' ';
      const { r, g, b } = hexToRgb(element.color);
      const uiAngle = element.rotation || 0;
      const pdfAngle = -uiAngle;
      const angleRad = (pdfAngle * Math.PI) / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      const textWidthPt = Math.max(1, font.widthOfTextAtSize(textToDraw, element.fontSize));
      const textHeightPt = Math.max(1, element.fontSize * 1.1);
      const centerOffsetX = textWidthPt * 0.5;
      const centerOffsetY = element.fontSize * 0.3;

      const drawCenteredRotatedText = (centerX: number, centerY: number) => {
        const anchorX = centerX - (centerOffsetX * cos - centerOffsetY * sin);
        const anchorY = centerY - (centerOffsetX * sin + centerOffsetY * cos);
        page.drawText(textToDraw, {
          x: anchorX,
          y: anchorY,
          size: element.fontSize,
          font,
          color: rgb(r, g, b),
          opacity: element.opacity,
          rotate: degrees(pdfAngle),
        });
      };

      if (!element.repeatEnabled) {
        const xTopLeft = element.x * pageWidth;
        const yTop = element.y * pageHeight;
        const centerX = xTopLeft + textWidthPt * 0.5;
        const centerY = pageHeight - yTop - textHeightPt * 0.5;
        drawCenteredRotatedText(centerX, centerY);
      } else {
        const charCount = Math.max(4, textToDraw.trim().length || 0);
        const baseWidthRatio = Math.max(0.08, (element.fontSize * charCount * 0.64) / pageWidth);
        const baseHeightRatio = Math.max(0.02, (element.fontSize * 1.35) / pageHeight);
        const absCos = Math.abs(Math.cos(angleRad));
        const absSin = Math.abs(Math.sin(angleRad));
        const textWidthRatio = clamp(baseWidthRatio * absCos + baseHeightRatio * absSin, 0.14, 1.2);
        const textHeightRatio = clamp(baseWidthRatio * absSin + baseHeightRatio * absCos, 0.03, 0.35);
        const stepX = Math.max(textWidthRatio * 1.22, textWidthRatio + 0.06);
        const stepY = Math.max(textHeightRatio * 1.3, textHeightRatio + 0.05);
        const startX = -textWidthRatio + clamp(element.x, 0, 1);
        const startY = -textHeightRatio + clamp(element.y, 0, 1);
        const cols = Math.max(1, Math.ceil((1 + textWidthRatio * 3) / stepX));
        const rows = Math.max(1, Math.ceil((1 + textHeightRatio * 3) / stepY));
        const repeatCount = Math.min(700, cols * rows);

        for (let i = 0; i < repeatCount; i += 1) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const staggerX = row % 2 === 1 ? stepX * 0.5 : 0;
          const xRatio = startX + staggerX + col * stepX;
          const yRatio = startY + row * stepY;
          const centerX = (xRatio + textWidthRatio * 0.5) * pageWidth;
          const centerY = pageHeight - ((yRatio + textHeightRatio * 0.5) * pageHeight);
          drawCenteredRotatedText(centerX, centerY);
        }
      }
      continue;
    }

    if (element.type === 'stroke') {
      const strokePaths = [...(element.paths ?? []), element.points].filter((path) => path.length >= 4);
      if (strokePaths.length === 0) {
        continue;
      }
      const { r, g, b } = hexToRgb(element.color);
      for (const path of strokePaths) {
        for (let i = 0; i < path.length - 2; i += 2) {
          const sx = path[i] * pageWidth;
          const sy = pageHeight - (path[i + 1] * pageHeight);
          const ex = path[i + 2] * pageWidth;
          const ey = pageHeight - (path[i + 3] * pageHeight);
          page.drawLine({
            start: { x: sx, y: sy },
            end: { x: ex, y: ey },
            thickness: element.width,
            color: rgb(r, g, b),
            opacity: element.opacity,
          });
        }
      }
      continue;
    }

    if (trueReplaceApplied && isAutoWhiteoutRect(element)) {
      continue;
    }
    if (element.type === 'image') {
      const decoded = dataUrlToBytes(element.dataUrl);
      if (!decoded) {
        continue;
      }
      const cacheKey = `${decoded.mimeType}:${element.dataUrl.length}:${element.dataUrl.slice(0, 64)}`;
      let embedded = imageCache.get(cacheKey);
      if (!embedded) {
        embedded = decoded.mimeType === 'image/png'
          ? await pdf.embedPng(decoded.bytes)
          : await pdf.embedJpg(decoded.bytes);
        imageCache.set(cacheKey, embedded);
      }

      const sx = element.x * pageWidth;
      const sy = pageHeight - ((element.y + element.h) * pageHeight);
      const sw = element.w * pageWidth;
      const sh = element.h * pageHeight;
      page.drawImage(embedded, {
        x: sx,
        y: sy,
        width: sw,
        height: sh,
        opacity: element.opacity,
      });
      continue;
    }
    const sx = element.x * pageWidth;
    const sy = pageHeight - ((element.y + element.h) * pageHeight);
    const sw = element.w * pageWidth;
    const sh = element.h * pageHeight;
    const strokeRgb = hexToRgb(element.stroke);
    const fillRgb = hexToRgb(element.fill);
    const fillColor = element.fill === 'transparent'
      ? undefined
      : rgb(fillRgb.r, fillRgb.g, fillRgb.b);

    page.drawRectangle({
      x: sx,
      y: sy,
      width: sw,
      height: sh,
      borderWidth: element.strokeWidth,
      borderColor: rgb(strokeRgb.r, strokeRgb.g, strokeRgb.b),
      color: fillColor,
      opacity: element.opacity,
      borderOpacity: element.opacity,
    });
  }

  const outputBytes = await pdf.save();
  const stableBytes = new Uint8Array(outputBytes.byteLength);
  stableBytes.set(outputBytes);
  return {
    outputBytes: stableBytes,
    overflowDetected,
    trueReplaceApplied,
    trueReplaceFallbackReason,
  };
}
