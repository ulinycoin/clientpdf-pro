import type { ToolLogicFunction } from '../../../core/types/contracts';
import { createQpdfEngine, type QpdfEngine } from '../../../services/pdf/qpdf-engine';
import { QpdfPipelineError } from '../../../services/pdf/qpdf-errors';
import fontkit from '@pdf-lib/fontkit';

type QualityPreset = 'standard' | 'high' | 'min';
type BlockKind = 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'list' | 'table' | 'image' | 'blank';

interface RenderBlock {
  kind: BlockKind;
  text: string;
  imageDataUrl?: string;
  headingLevel?: 1 | 2 | 3;
}

interface ConversionOptions {
  quality: QualityPreset;
  pdfA: boolean;
  protectWithPassword: boolean;
  password: string;
  searchablePdf: boolean;
}

interface QualityProfile {
  defaultFontSize: number;
  lineHeight: number;
  paragraphGap: number;
  leftRightMargin: number;
  topBottomMargin: number;
  compressStreams: boolean;
}

const ZIP_SIGNATURE = [0x50, 0x4b];
const CFB_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const RASTER_FONT_STACK = '"Noto Sans","Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Segoe UI Symbol","Arial Unicode MS","Noto Sans Symbols 2","Noto Sans CJK SC","Noto Sans CJK JP","Noto Sans Devanagari","PingFang SC","Hiragino Sans","Yu Gothic","Microsoft YaHei","Mangal","Kohinoor Devanagari",sans-serif';

function isZipContainer(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === ZIP_SIGNATURE[0] && bytes[1] === ZIP_SIGNATURE[1];
}

function isLegacyDocContainer(bytes: Uint8Array): boolean {
  if (bytes.length < CFB_SIGNATURE.length) {
    return false;
  }
  for (let i = 0; i < CFB_SIGNATURE.length; i += 1) {
    if (bytes[i] !== CFB_SIGNATURE[i]) {
      return false;
    }
  }
  return true;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function normalizeWhitespace(input: string): string {
  return input
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/[ ]+/g, ' ')
    .trim();
}

function stripHtmlTags(input: string): string {
  const stripped = decodeHtmlEntities(input.replace(/<[^>]+>/g, ' '));
  return normalizeWhitespace(
    stripped
      .replace(/\breturn\s+true\s*;\s*}/gi, ' ')
      .replace(/\bfunction\s+\w+\s*\([^)]*\)\s*{/gi, ' '),
  );
}

function extractAttributeValue(tag: string, attribute: string): string {
  const escaped = attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${escaped}\\s*=\\s*["']([^"']+)["']`, 'i');
  const match = regex.exec(tag);
  return match?.[1] ?? '';
}

function flattenAnchorLinks(input: string): string {
  return input.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_whole, attrs: string, body: string) => {
    const href = extractAttributeValue(attrs, 'href').trim();
    const label = stripHtmlTags(body);
    if (label.length === 0) {
      return href.length > 0 ? href : '';
    }
    if (href.length === 0) {
      return label;
    }
    return `${label} (${href})`;
  });
}

function extractTableRows(html: string): string[] {
  const rows: string[] = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch = rowRegex.exec(html);
  while (rowMatch) {
    const rowHtml = rowMatch[1];
    const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
    const cells: string[] = [];
    let cellMatch = cellRegex.exec(rowHtml);
    while (cellMatch) {
      const cellText = stripHtmlTags(flattenAnchorLinks(cellMatch[1]));
      if (cellText.length > 0) {
        cells.push(cellText);
      }
      cellMatch = cellRegex.exec(rowHtml);
    }
    if (cells.length > 0) {
      rows.push(cells.join(' | '));
    }
    rowMatch = rowRegex.exec(html);
  }
  return rows;
}

function extractBlocksFromHtml(htmlRaw: string): RenderBlock[] {
  const html = htmlRaw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\n/g, ' ');
  const blocks: RenderBlock[] = [];
  const tokenRegex = /<(h1|h2|h3|p|table|ol|ul)\b[^>]*>[\s\S]*?<\/\1>|<img\b[^>]*>/gi;
  let match = tokenRegex.exec(html);

  while (match) {
    const token = match[0];
    const imageTagMatch = /^<img\b/i.exec(token);
    if (imageTagMatch) {
      const src = extractAttributeValue(token, 'src');
      if (src.startsWith('data:image/')) {
        blocks.push({ kind: 'image', text: '[Image]', imageDataUrl: src });
      } else {
        blocks.push({ kind: 'image', text: '[Image omitted in local mode]' });
      }
      match = tokenRegex.exec(html);
      continue;
    }

    const tagMatch = /^<(h1|h2|h3|p|table|ol|ul)\b[^>]*>([\s\S]*?)<\/\1>$/i.exec(token);
    if (!tagMatch) {
      match = tokenRegex.exec(html);
      continue;
    }

    const tag = tagMatch[1].toLowerCase();
    const body = tagMatch[2];

    if (tag === 'table') {
      const rows = extractTableRows(body);
      if (rows.length > 0) {
        blocks.push({ kind: 'table', text: rows.join('\n') });
      }
      match = tokenRegex.exec(html);
      continue;
    }

    if (tag === 'ol' || tag === 'ul') {
      const itemRegex = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
      let itemMatch = itemRegex.exec(body);
      let itemIndex = 1;
      while (itemMatch) {
        const itemText = stripHtmlTags(flattenAnchorLinks(itemMatch[1]));
        if (itemText.length > 0) {
          const marker = tag === 'ol' ? `${itemIndex}. ` : '• ';
          blocks.push({ kind: 'list', text: `${marker}${itemText}` });
          itemIndex += 1;
        }
        itemMatch = itemRegex.exec(body);
      }
      match = tokenRegex.exec(html);
      continue;
    }

    const text = stripHtmlTags(flattenAnchorLinks(body));
    if (text.length === 0) {
      match = tokenRegex.exec(html);
      continue;
    }

    if (tag === 'h1') {
      blocks.push({ kind: 'heading1', text, headingLevel: 1 });
    } else if (tag === 'h2') {
      blocks.push({ kind: 'heading2', text, headingLevel: 2 });
    } else if (tag === 'h3') {
      blocks.push({ kind: 'heading3', text, headingLevel: 3 });
    } else {
      blocks.push({ kind: 'paragraph', text });
    }

    match = tokenRegex.exec(html);
  }

  if (blocks.length > 0) {
    return blocks;
  }

  const plain = stripHtmlTags(html);
  if (plain.length === 0) {
    return [{ kind: 'blank', text: '' }];
  }
  return plain
    .split('\n')
    .map((line) => normalizeWhitespace(line))
    .filter((line) => line.length > 0)
    .map((line) => ({ kind: 'paragraph', text: line }));
}

function getQualityProfile(quality: QualityPreset, pdfA: boolean): QualityProfile {
  if (quality === 'high') {
    return {
      defaultFontSize: 12,
      lineHeight: 1.45,
      paragraphGap: 6,
      leftRightMargin: 48,
      topBottomMargin: 52,
      compressStreams: !pdfA,
    };
  }
  if (quality === 'min') {
    return {
      defaultFontSize: 10,
      lineHeight: 1.25,
      paragraphGap: 4,
      leftRightMargin: 36,
      topBottomMargin: 42,
      compressStreams: !pdfA,
    };
  }
  return {
    defaultFontSize: 11,
    lineHeight: 1.35,
    paragraphGap: 5,
    leftRightMargin: 42,
    topBottomMargin: 48,
    compressStreams: !pdfA,
  };
}

function parseOptions(options: Record<string, unknown> | undefined): ConversionOptions {
  const qualityRaw = options?.quality;
  const quality: QualityPreset = qualityRaw === 'high' || qualityRaw === 'min' ? qualityRaw : 'standard';
  const pdfA = options?.pdfA === true;
  const protectWithPassword = options?.protectWithPassword === true;
  const password = typeof options?.password === 'string' ? options.password.trim() : '';
  const searchablePdf = options?.searchablePdf !== false;
  return { quality, pdfA, protectWithPassword, password, searchablePdf };
}

function scaleProfile(profile: QualityProfile, scale: number): QualityProfile {
  const safeScale = Math.max(0.65, Math.min(1, scale));
  return {
    defaultFontSize: Math.max(8.5, profile.defaultFontSize * safeScale),
    lineHeight: Math.max(1.08, profile.lineHeight * (0.95 + safeScale * 0.05)),
    paragraphGap: Math.max(2, Math.round(profile.paragraphGap * safeScale)),
    leftRightMargin: Math.max(18, Math.round(profile.leftRightMargin * safeScale)),
    topBottomMargin: Math.max(20, Math.round(profile.topBottomMargin * safeScale)),
    compressStreams: profile.compressStreams,
  };
}

function getFontSizeByBlock(kind: BlockKind, baseSize: number): number {
  if (kind === 'heading1') {
    return Math.round(baseSize * 1.7);
  }
  if (kind === 'heading2') {
    return Math.round(baseSize * 1.45);
  }
  if (kind === 'heading3') {
    return Math.round(baseSize * 1.25);
  }
  if (kind === 'table') {
    return Math.max(9, Math.round(baseSize * 0.95));
  }
  if (kind === 'image') {
    return baseSize;
  }
  if (kind === 'list') {
    return baseSize;
  }
  if (kind === 'blank') {
    return baseSize;
  }
  return baseSize;
}

function getParagraphGap(kind: BlockKind, profile: QualityProfile): number {
  if (kind === 'heading1') {
    return profile.paragraphGap + 4;
  }
  if (kind === 'heading2') {
    return profile.paragraphGap + 3;
  }
  if (kind === 'heading3') {
    return profile.paragraphGap + 2;
  }
  if (kind === 'table') {
    return profile.paragraphGap + 2;
  }
  if (kind === 'blank') {
    return profile.paragraphGap + 4;
  }
  return profile.paragraphGap;
}

function ensurePageCapacity(
  yTop: number,
  topMargin: number,
  bottomMargin: number,
  requiredHeight: number,
  addPage: () => void,
  resetYTop: () => number,
): number {
  const remainingHeight = yTop - bottomMargin;
  if (remainingHeight >= requiredHeight) {
    return yTop;
  }
  addPage();
  return resetYTop() - topMargin;
}

function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  throw new Error('Base64 decoding is unavailable in this runtime');
}

function parseDataUrl(dataUrl: string): { mimeType: string; bytes: Uint8Array } | null {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl.trim());
  if (!match) {
    return null;
  }
  const mimeType = match[1].toLowerCase();
  const base64 = match[2];
  return { mimeType, bytes: base64ToUint8Array(base64) };
}

async function loadFontBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load font: ${url}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function resolveNotoFontUrls(): Promise<{ latinUrl: string; cyrillicUrl: string; cyrillicExtUrl: string }> {
  const [latinMod, cyrillicMod, cyrillicExtMod] = await Promise.all([
    import('@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff?url') as Promise<{ default: string }>,
    import('@fontsource/noto-sans/files/noto-sans-cyrillic-400-normal.woff?url') as Promise<{ default: string }>,
    import('@fontsource/noto-sans/files/noto-sans-cyrillic-ext-400-normal.woff?url') as Promise<{ default: string }>,
  ]);
  return { latinUrl: latinMod.default, cyrillicUrl: cyrillicMod.default, cyrillicExtUrl: cyrillicExtMod.default };
}

function hasCyrillic(text: string): boolean {
  return /\p{Script=Cyrillic}/u.test(text);
}

function hasCjk(text: string): boolean {
  return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text);
}

function hasDevanagari(text: string): boolean {
  return /\p{Script=Devanagari}/u.test(text);
}

function needsRasterFallback(text: string): boolean {
  return hasCyrillic(text) || hasCjk(text) || hasDevanagari(text);
}

function shouldUseRasterFallback(text: string, searchablePdf: boolean): boolean {
  return !searchablePdf && needsRasterFallback(text);
}

function create2dCanvas(
  width: number,
  height: number,
): { canvas: OffscreenCanvas | HTMLCanvasElement; context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D } | null {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));

  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(w, h);
    const context = canvas.getContext('2d');
    if (context) {
      return { canvas, context };
    }
    return null;
  }

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext('2d');
    if (context) {
      return { canvas, context };
    }
  }

  return null;
}

async function rasterizeTextLine(
  text: string,
  maxWidth: number,
  lineHeight: number,
  fontSize: number,
  bold: boolean,
): Promise<{ bytes: Uint8Array; width: number; height: number } | null> {
  const probe = create2dCanvas(Math.max(16, maxWidth), Math.max(16, lineHeight + 10));
  if (!probe) {
    return null;
  }
  const probeContext = probe.context;
  const fontWeight = bold ? '700' : '400';
  probeContext.font = `${fontWeight} ${fontSize}px ${RASTER_FONT_STACK}`;
  const measured = probeContext.measureText(text);
  const naturalWidth = Math.max(8, Math.ceil(measured.width) + 6);
  const imageWidth = Math.min(Math.max(8, maxWidth), naturalWidth);
  const imageHeight = Math.max(lineHeight + 8, Math.ceil(fontSize * 1.5));

  const canvasNode = create2dCanvas(imageWidth, imageHeight);
  if (!canvasNode) {
    return null;
  }

  const { canvas, context } = canvasNode;
  context.clearRect(0, 0, imageWidth, imageHeight);
  context.fillStyle = '#111';
  context.textBaseline = 'top';
  context.font = `${fontWeight} ${fontSize}px ${RASTER_FONT_STACK}`;
  context.fillText(text, 0, 1, imageWidth);

  let blob: Blob | null = null;
  if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
    blob = await canvas.convertToBlob({ type: 'image/png' });
  } else if (typeof HTMLCanvasElement !== 'undefined' && canvas instanceof HTMLCanvasElement) {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  }

  if (!blob) {
    return null;
  }

  const bytes = new Uint8Array(await blob.arrayBuffer());
  return {
    bytes,
    width: imageWidth,
    height: imageHeight,
  };
}

function wrapText(
  text: string,
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  fontSize: number,
  maxWidth: number,
): string[] {
  const rawParagraphs = text.split('\n');
  const lines: string[] = [];

  for (const paragraph of rawParagraphs) {
    const clean = paragraph.trim();
    if (clean.length === 0) {
      continue;
    }

    const words = clean.split(/\s+/);
    let current = '';
    for (const word of words) {
      const candidate = current.length > 0 ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current.length > 0) {
        lines.push(current);
      }

      if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
        current = word;
        continue;
      }

      let chunk = '';
      for (const ch of Array.from(word)) {
        const nextChunk = `${chunk}${ch}`;
        if (font.widthOfTextAtSize(nextChunk, fontSize) <= maxWidth) {
          chunk = nextChunk;
        } else {
          if (chunk.length > 0) {
            lines.push(chunk);
          }
          chunk = ch;
        }
      }
      current = chunk;
    }

    if (current.length > 0) {
      lines.push(current);
    }
  }

  return lines.length > 0 ? lines : [''];
}

function wrapTextByCanvas(text: string, maxWidth: number, fontSize: number): string[] {
  const canvasNode = create2dCanvas(Math.max(16, maxWidth), Math.max(16, Math.ceil(fontSize * 1.6)));
  if (!canvasNode) {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  const context = canvasNode.context;
  context.font = `${fontSize}px ${RASTER_FONT_STACK}`;

  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    const clean = paragraph.trim();
    if (clean.length === 0) {
      continue;
    }

    let current = '';
    for (const ch of Array.from(clean)) {
      const candidate = `${current}${ch}`;
      if (context.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        if (current.length > 0) {
          lines.push(current);
        }
        current = ch;
      }
    }
    if (current.length > 0) {
      lines.push(current);
    }
  }

  return lines.length > 0 ? lines : [''];
}

function countRenderableCodePoints(
  font: { widthOfTextAtSize?: (text: string, size: number) => number },
  text: string,
  size: number,
): number {
  let ok = 0;
  for (const ch of Array.from(text)) {
    if (canMeasureTextWithFont(font, ch, size)) {
      ok += 1;
    }
  }
  return ok;
}

function canMeasureTextWithFont(
  font: { widthOfTextAtSize?: (text: string, size: number) => number },
  text: string,
  size: number,
): boolean {
  if (typeof font.widthOfTextAtSize !== 'function') {
    return false;
  }
  try {
    const width = font.widthOfTextAtSize(text.length > 0 ? text : ' ', size);
    return Number.isFinite(width);
  } catch {
    return false;
  }
}

function canFontRenderText(
  font: { widthOfTextAtSize?: (text: string, size: number) => number },
  text: string,
  size: number,
): boolean {
  return canMeasureTextWithFont(font, text, size);
}

function isRasterPreferredCodePoint(codePoint: number): boolean {
  return (
    (codePoint >= 0x1f000 && codePoint <= 0x1faff) || // Emoji and symbols
    (codePoint >= 0x2190 && codePoint <= 0x21ff) || // Arrows
    (codePoint >= 0x2300 && codePoint <= 0x23ff) || // Misc technical
    (codePoint >= 0x2460 && codePoint <= 0x24ff) || // Enclosed alphanumerics
    (codePoint >= 0x25a0 && codePoint <= 0x25ff) || // Geometric shapes
    (codePoint >= 0x2600 && codePoint <= 0x27bf) || // Misc symbols + dingbats (includes checkmarks)
    (codePoint >= 0x2b00 && codePoint <= 0x2bff) || // Misc symbols and arrows
    codePoint === 0x200d || // ZWJ (emoji sequences)
    codePoint === 0xfe0f // Variation selector-16
  );
}

function isRasterPreferredChar(ch: string): boolean {
  const codePoint = ch.codePointAt(0);
  if (typeof codePoint !== 'number') {
    return false;
  }
  return isRasterPreferredCodePoint(codePoint);
}

async function convertDocxWithMammoth(
  mammoth: {
    convertToHtml: (input: any) => Promise<{ value: string }>;
    extractRawText: (input: any) => Promise<{ value: string }>;
  },
  arrayBuffer: ArrayBuffer,
): Promise<{ html: string; text: string }> {
  const browserInput = { arrayBuffer };
  try {
    const [htmlResult, textResult] = await Promise.all([
      mammoth.convertToHtml(browserInput),
      mammoth.extractRawText(browserInput),
    ]);
    return { html: htmlResult.value, text: textResult.value };
  } catch (error) {
    const supportsNodeBuffer = typeof Buffer !== 'undefined';
    const message = error instanceof Error ? error.message : '';
    const shouldRetryWithBuffer = supportsNodeBuffer && /could not find file in options/i.test(message);
    if (!shouldRetryWithBuffer) {
      throw error;
    }

    const nodeInput = { buffer: Buffer.from(arrayBuffer) };
    const [htmlResult, textResult] = await Promise.all([
      mammoth.convertToHtml(nodeInput),
      mammoth.extractRawText(nodeInput),
    ]);
    return { html: htmlResult.value, text: textResult.value };
  }
}

interface HeadingAnchor {
  title: string;
  level: 1 | 2 | 3;
  pageRef: unknown;
}

interface PdfLibAnnots {
  PDFName: { of: (value: string) => unknown };
  PDFNumber: { of: (value: number) => unknown };
  PDFString: { of: (value: string) => unknown };
  PDFArray: unknown;
}

function addGoToLinkAnnotation(
  pdfLib: PdfLibAnnots,
  doc: { context: { obj: (value: unknown) => unknown; register: (value: unknown) => unknown } },
  sourcePage: { node: { lookupMaybe: (key: unknown, type: unknown) => any; set: (key: unknown, value: unknown) => void } },
  rect: { x: number; y: number; width: number; height: number },
  destinationPageRef: unknown,
): void {
  const { PDFName, PDFNumber, PDFArray } = pdfLib;
  const annotsKey = PDFName.of('Annots');
  const rectArray = doc.context.obj([
    PDFNumber.of(rect.x),
    PDFNumber.of(rect.y),
    PDFNumber.of(rect.x + rect.width),
    PDFNumber.of(rect.y + rect.height),
  ]);
  const borderArray = doc.context.obj([PDFNumber.of(0), PDFNumber.of(0), PDFNumber.of(0)]);
  const destArray = doc.context.obj([destinationPageRef, PDFName.of('Fit')]);
  const action = doc.context.obj({
    S: PDFName.of('GoTo'),
    D: destArray,
  });
  const annot = doc.context.obj({
    Type: PDFName.of('Annot'),
    Subtype: PDFName.of('Link'),
    Rect: rectArray,
    Border: borderArray,
    A: action,
  });
  const annotRef = doc.context.register(annot);
  let annots = sourcePage.node.lookupMaybe(annotsKey, PDFArray as any) as { push: (value: unknown) => void } | undefined;
  if (!annots) {
    const created = doc.context.obj([]) as { push: (value: unknown) => void };
    sourcePage.node.set(annotsKey, created);
    annots = created;
  }
  annots.push(annotRef);
}

function addUriLinkAnnotation(
  pdfLib: PdfLibAnnots,
  doc: { context: { obj: (value: unknown) => unknown; register: (value: unknown) => unknown } },
  sourcePage: { node: { lookupMaybe: (key: unknown, type: unknown) => any; set: (key: unknown, value: unknown) => void } },
  rect: { x: number; y: number; width: number; height: number },
  uri: string,
): void {
  const { PDFName, PDFNumber, PDFString, PDFArray } = pdfLib;
  const annotsKey = PDFName.of('Annots');
  const rectArray = doc.context.obj([
    PDFNumber.of(rect.x),
    PDFNumber.of(rect.y),
    PDFNumber.of(rect.x + rect.width),
    PDFNumber.of(rect.y + rect.height),
  ]);
  const borderArray = doc.context.obj([PDFNumber.of(0), PDFNumber.of(0), PDFNumber.of(0)]);
  const action = doc.context.obj({
    S: PDFName.of('URI'),
    URI: PDFString.of(uri),
  });
  const annot = doc.context.obj({
    Type: PDFName.of('Annot'),
    Subtype: PDFName.of('Link'),
    Rect: rectArray,
    Border: borderArray,
    A: action,
  });
  const annotRef = doc.context.register(annot);
  let annots = sourcePage.node.lookupMaybe(annotsKey, PDFArray as any) as { push: (value: unknown) => void } | undefined;
  if (!annots) {
    const created = doc.context.obj([]) as { push: (value: unknown) => void };
    sourcePage.node.set(annotsKey, created);
    annots = created;
  }
  annots.push(annotRef);
}

async function protectPdfIfRequested(
  blob: Blob,
  options: ConversionOptions,
  engineFactory: () => Promise<QpdfEngine>,
): Promise<Blob> {
  if (!options.protectWithPassword) {
    return blob;
  }
  if (!options.password) {
    throw new QpdfPipelineError('PROTECT_INVALID_OPTIONS', 'Password is required when protection is enabled.');
  }

  const engine = await engineFactory();
  return engine.encrypt(blob, {
    userPassword: options.password,
    ownerPassword: options.password,
    keyLength: 256,
  });
}

export async function runWordToPdf(
  { inputIds, fs, options, emitProgress }: Parameters<ToolLogicFunction>[0],
  engineFactory: () => Promise<QpdfEngine>,
): Promise<{ outputIds: string[] }> {
  if (inputIds.length === 0) {
    throw new Error('Word to PDF requires at least one input file');
  }

  const parsedOptions = parseOptions(options);

  const mammoth = await import('mammoth');
  const { PDFDocument, StandardFonts, PDFArray, PDFName, PDFNumber, PDFString } = await import('pdf-lib');

  const outputIds: string[] = [];

  for (let i = 0; i < inputIds.length; i += 1) {
    const entry = await fs.read(inputIds[i]);
    const blob = await entry.getBlob();
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    if (isLegacyDocContainer(bytes)) {
      throw new Error('Legacy .doc is not supported in secure local mode. Save as .docx and retry.');
    }
    if (!isZipContainer(bytes)) {
      throw new Error(`Unsupported Word file format for ${inputIds[i]}. Please upload a .docx file.`);
    }

    const converted = await convertDocxWithMammoth(mammoth, arrayBuffer);
    const blocks = extractBlocksFromHtml(converted.html);
    if (blocks.length === 1 && blocks[0].kind === 'blank') {
      const fallbackText = normalizeWhitespace(converted.text);
      if (fallbackText.length > 0) {
        blocks[0] = { kind: 'paragraph', text: fallbackText };
      }
    }

    const baseProfile = getQualityProfile(parsedOptions.quality, parsedOptions.pdfA);
    const pageSize: [number, number] = [595.28, 841.89];
    const fitScaleCandidates = [1];

    const renderAttempt = async (profile: QualityProfile): Promise<{ blob: Blob; pageCount: number }> => {
      const doc = await PDFDocument.create();
      doc.setTitle(`${entry.getName().replace(/\.[^.]+$/, '') || 'Document'} (Converted)`);
      doc.setCreator('LocalPDF');
      doc.setSubject(parsedOptions.pdfA ? 'Archive conversion profile (best-effort)' : 'Word to PDF conversion');
      doc.setKeywords(parsedOptions.pdfA ? ['word', 'pdf', 'pdfa', 'best-effort'] : ['word', 'pdf', 'conversion']);

      let latinFont = await doc.embedFont(StandardFonts.Helvetica);
      let cyrillicFont = latinFont;
      let cyrillicExtFont = latinFont;

      try {
        doc.registerFontkit(fontkit);
        const { latinUrl, cyrillicUrl, cyrillicExtUrl } = await resolveNotoFontUrls();
        const [latinBytes, cyrillicBytes, cyrillicExtBytes] = await Promise.all([
          loadFontBytes(latinUrl),
          loadFontBytes(cyrillicUrl),
          loadFontBytes(cyrillicExtUrl),
        ]);
        latinFont = await doc.embedFont(latinBytes, { subset: true });
        cyrillicFont = await doc.embedFont(cyrillicBytes, { subset: true });
        cyrillicExtFont = await doc.embedFont(cyrillicExtBytes, { subset: true });
      } catch {
        // Keep Helvetica fallback for environments where custom font loading is unavailable.
      }

      const selectFont = (text: string, size = 12): typeof latinFont => {
        const preferCyrillic = hasCyrillic(text);
        const candidates = preferCyrillic
          ? [cyrillicFont, cyrillicExtFont, latinFont]
          : [latinFont, cyrillicFont, cyrillicExtFont];
        for (const candidate of candidates) {
          if (canFontRenderText(candidate, text, size)) {
            return candidate;
          }
        }

        let best = latinFont;
        let bestScore = countRenderableCodePoints(latinFont, text, size);
        for (const candidate of [cyrillicFont, cyrillicExtFont]) {
          const score = countRenderableCodePoints(candidate, text, size);
          if (score > bestScore) {
            best = candidate;
            bestScore = score;
          }
        }
        return best;
      };

      const drawSegmentedTextLine = async (
        text: string,
        x: number,
        y: number,
        size: number,
        lineHeightPx: number,
        maxLineLengthPx: number,
        bold: boolean,
      ): Promise<void> => {
        const chars = Array.from(text.length > 0 ? text : ' ');
        let cursorX = x;
        let segment = chars[0] ?? ' ';
        let segmentFont = selectFont(segment, size);
        let rasterSegment = isRasterPreferredChar(segment);

        const flush = async (): Promise<void> => {
          if (segment.length === 0) {
            return;
          }
          if (rasterSegment) {
            const remainingWidth = Math.max(8, Math.round((x + maxLineLengthPx) - cursorX));
            const raster = await rasterizeTextLine(
              segment,
              remainingWidth,
              Math.round(lineHeightPx),
              Math.round(size),
              bold,
            );
            if (raster) {
              const image = await doc.embedPng(raster.bytes);
              page.drawImage(image, {
                x: cursorX,
                y: y - Math.max(0, raster.height - lineHeightPx),
                width: raster.width,
                height: raster.height,
              });
              cursorX += raster.width;
              return;
            }
          }

          page.drawText(segment, {
            x: cursorX,
            y,
            size,
            font: segmentFont,
          });
          cursorX += segmentFont.widthOfTextAtSize(segment, size);
        };

        for (let index = 1; index < chars.length; index += 1) {
          const nextChar = chars[index];
          const nextFont = selectFont(nextChar, size);
          const nextRaster = isRasterPreferredChar(nextChar);
          if (nextRaster === rasterSegment && (nextRaster || nextFont === segmentFont)) {
            segment += nextChar;
            continue;
          }
          await flush();
          segment = nextChar;
          segmentFont = nextFont;
          rasterSegment = nextRaster;
        }
        await flush();
      };

      const measureSegmentedWidth = (text: string, size: number): number => {
        let width = 0;
        for (const ch of Array.from(text)) {
          const font = selectFont(ch, size);
          try {
            width += font.widthOfTextAtSize(ch, size);
          } catch {
            width += Math.max(2, size * 0.55);
          }
        }
        return width;
      };

      let page = doc.addPage(pageSize);
      let pageIndex = 0;
      const pagesWithContent = new Set<number>();
      const headingAnchors: HeadingAnchor[] = [];
      const livePageWidth = page.getWidth();
      const livePageHeight = page.getHeight();
      let yTop = livePageHeight - profile.topBottomMargin;
      const addPage = (): void => {
        if (pageIndex >= 0 && !pagesWithContent.has(pageIndex)) {
          const remainingHeight = yTop - profile.topBottomMargin;
          if (remainingHeight > livePageHeight * 0.85) {
            return;
          }
        }
        page = doc.addPage(pageSize);
        pageIndex += 1;
        yTop = page.getHeight() - profile.topBottomMargin;
      };
      const resetYTop = (): number => page.getHeight();

      for (const block of blocks) {
        const blockSize = getFontSizeByBlock(block.kind, profile.defaultFontSize);
        const lineHeight = Math.max(10, Math.round(blockSize * profile.lineHeight));
        const maxLineLength = livePageWidth - profile.leftRightMargin * 2;

        if (block.kind === 'blank') {
          yTop -= getParagraphGap(block.kind, profile);
          continue;
        }

        if (block.kind === 'image') {
          const imageWidth = maxLineLength;
          const imageHeightBase = parsedOptions.quality === 'high' ? 180 : (parsedOptions.quality === 'min' ? 100 : 140);
          const imageHeight = Math.max(68, Math.round(imageHeightBase * (profile.defaultFontSize / baseProfile.defaultFontSize)));
          yTop = ensurePageCapacity(
            yTop,
            profile.topBottomMargin,
            profile.topBottomMargin,
            imageHeight + getParagraphGap(block.kind, profile),
            addPage,
            resetYTop,
          );
          if (block.imageDataUrl?.startsWith('data:image/')) {
            try {
              const parsedImage = parseDataUrl(block.imageDataUrl);
              if (!parsedImage) {
                throw new Error('Invalid image payload');
              }
              const image = parsedImage.mimeType === 'image/png'
                ? await doc.embedPng(parsedImage.bytes)
                : await doc.embedJpg(parsedImage.bytes);
              page.drawImage(image, {
                x: profile.leftRightMargin,
                y: yTop - imageHeight,
                width: imageWidth,
                height: imageHeight,
              });
              pagesWithContent.add(pageIndex);
            } catch {
              const font = selectFont(block.text);
              page.drawText('[Image]', {
                x: profile.leftRightMargin,
                y: yTop - lineHeight,
                size: blockSize,
                font,
              });
              pagesWithContent.add(pageIndex);
            }
          } else {
            const font = selectFont(block.text);
            page.drawText(block.text, {
              x: profile.leftRightMargin,
              y: yTop - lineHeight,
              size: blockSize,
              font,
            });
            pagesWithContent.add(pageIndex);
          }
          yTop -= imageHeight + getParagraphGap(block.kind, profile);
          continue;
        }

        let lines: string[];
        try {
          lines = shouldUseRasterFallback(block.text, parsedOptions.searchablePdf)
            ? wrapTextByCanvas(block.text, maxLineLength, blockSize)
            : wrapText(block.text, selectFont(block.text, blockSize), blockSize, maxLineLength);
        } catch {
          lines = wrapTextByCanvas(block.text, maxLineLength, blockSize);
        }
        let headingAnchorCaptured = false;
        for (const line of lines) {
          let lineAdvance = lineHeight;
          let rasterLine: { bytes: Uint8Array; width: number; height: number } | null = null;
          const cleanLine = line.length > 0 ? line : ' ';

          if (shouldUseRasterFallback(cleanLine, parsedOptions.searchablePdf)) {
            rasterLine = await rasterizeTextLine(
              cleanLine,
              Math.round(maxLineLength),
              Math.round(lineHeight),
              Math.round(blockSize),
              block.kind.startsWith('heading'),
            );
            if (rasterLine) {
              lineAdvance = Math.max(lineHeight, rasterLine.height);
            }
          }

          yTop = ensurePageCapacity(
            yTop,
            profile.topBottomMargin,
            profile.topBottomMargin,
            lineAdvance,
            addPage,
            resetYTop,
          );

          if (rasterLine) {
            const image = await doc.embedPng(rasterLine.bytes);
            page.drawImage(image, {
              x: profile.leftRightMargin,
              y: yTop - rasterLine.height,
              width: rasterLine.width,
              height: rasterLine.height,
            });
            pagesWithContent.add(pageIndex);
          } else {
            try {
              await drawSegmentedTextLine(
                cleanLine,
                profile.leftRightMargin,
                yTop - lineHeight,
                blockSize,
                lineHeight,
                maxLineLength,
                block.kind.startsWith('heading'),
              );
            } catch {
              const fallbackRaster = await rasterizeTextLine(
                cleanLine,
                Math.round(maxLineLength),
                Math.round(lineHeight),
                Math.round(blockSize),
                block.kind.startsWith('heading'),
              );
              if (fallbackRaster) {
                const fallbackImage = await doc.embedPng(fallbackRaster.bytes);
                page.drawImage(fallbackImage, {
                  x: profile.leftRightMargin,
                  y: yTop - fallbackRaster.height,
                  width: fallbackRaster.width,
                  height: fallbackRaster.height,
                });
                lineAdvance = Math.max(lineAdvance, fallbackRaster.height);
              }
            }
            pagesWithContent.add(pageIndex);

            const urlRegex = /https?:\/\/[^\s)]+/gi;
            let urlMatch = urlRegex.exec(cleanLine);
            while (urlMatch) {
              const matchedUrl = urlMatch[0];
              const prefix = cleanLine.slice(0, urlMatch.index);
              const linkX = profile.leftRightMargin + measureSegmentedWidth(prefix, blockSize);
              const linkWidth = Math.max(8, measureSegmentedWidth(matchedUrl, blockSize));
              addUriLinkAnnotation(
                { PDFArray, PDFName, PDFNumber, PDFString },
                doc as unknown as { context: { obj: (value: unknown) => unknown; register: (value: unknown) => unknown } },
                page as unknown as { node: { lookupMaybe: (key: unknown, type: unknown) => any; set: (key: unknown, value: unknown) => void } },
                {
                  x: linkX,
                  y: yTop - lineHeight - 1,
                  width: linkWidth,
                  height: lineHeight + 3,
                },
                matchedUrl,
              );
              urlMatch = urlRegex.exec(cleanLine);
            }
          }

          if (block.headingLevel && !headingAnchorCaptured && line.trim().length > 0) {
            const currentPage = page as unknown as { ref?: unknown };
            if (currentPage.ref) {
              headingAnchors.push({
                title: line.trim(),
                level: block.headingLevel,
                pageRef: currentPage.ref,
              });
              headingAnchorCaptured = true;
            }
          }

          yTop -= lineAdvance;
        }
        yTop -= getParagraphGap(block.kind, profile);
      }

      if (headingAnchors.length > 0) {
        const tocPage = doc.insertPage(0, pageSize);
        const tocFont = selectFont('Table of Contents', 18);
        const bodyFont = selectFont('Contents', 11);
        const toAsciiFallback = (value: string): string => {
          const normalized = value.replace(/[^\x20-\x7E]/g, '');
          return normalized.trim().length > 0 ? normalized : 'Section';
        };
        const left = profile.leftRightMargin;
        const top = tocPage.getHeight() - profile.topBottomMargin;
        try {
          tocPage.drawText('Table of Contents', {
            x: left,
            y: top,
            size: 18,
            font: tocFont,
          });
        } catch {
          tocPage.drawText('Table of Contents', {
            x: left,
            y: top,
            size: 18,
            font: latinFont,
          });
        }

        let tocY = top - 30;
        const tocLineHeight = 16;
        const maxTocLines = Math.max(1, Math.floor((tocPage.getHeight() - profile.topBottomMargin * 2 - 40) / tocLineHeight));
        const tocItems = headingAnchors.slice(0, maxTocLines);

        for (const anchor of tocItems) {
          const indent = (anchor.level - 1) * 14;
          const rawLabel = anchor.title.length > 110 ? `${anchor.title.slice(0, 107)}...` : anchor.title;
          let label = rawLabel;
          let width = 0;
          try {
            tocPage.drawText(label, {
              x: left + indent,
              y: tocY,
              size: 11,
              font: bodyFont,
            });
            width = bodyFont.widthOfTextAtSize(label, 11);
          } catch {
            label = toAsciiFallback(rawLabel);
            tocPage.drawText(label, {
              x: left + indent,
              y: tocY,
              size: 11,
              font: latinFont,
            });
            width = latinFont.widthOfTextAtSize(label, 11);
          }
          addGoToLinkAnnotation(
            { PDFArray, PDFName, PDFNumber, PDFString },
            doc as unknown as { context: { obj: (value: unknown) => unknown; register: (value: unknown) => unknown } },
            tocPage as unknown as { node: { lookupMaybe: (key: unknown, type: unknown) => any; set: (key: unknown, value: unknown) => void } },
            { x: left + indent, y: tocY - 2, width, height: tocLineHeight },
            anchor.pageRef,
          );
          tocY -= tocLineHeight;
        }
      }

      if (!pagesWithContent.has(pageIndex) && doc.getPageCount() > 1) {
        doc.removePage(pageIndex);
      }

      const pdfBytes = await doc.save({ useObjectStreams: false });
      const normalized = new Uint8Array(pdfBytes.byteLength);
      normalized.set(pdfBytes);
      return {
        blob: new Blob([normalized], { type: 'application/pdf' }),
        pageCount: doc.getPageCount(),
      };
    };

    let rawPdfBlob: Blob | null = null;
    for (const scale of fitScaleCandidates) {
      const profile = scaleProfile(baseProfile, scale);
      const result = await renderAttempt(profile);
      rawPdfBlob = result.blob;
      if (result.pageCount >= 1) {
        break;
      }
    }

    if (!rawPdfBlob) {
      throw new Error('Failed to render output PDF');
    }

    const finalPdfBlob = await protectPdfIfRequested(rawPdfBlob, parsedOptions, engineFactory);
    const outEntry = await fs.write(finalPdfBlob);
    outputIds.push(outEntry.id);

    const progress = Math.round(((i + 1) / inputIds.length) * 100);
    emitProgress?.(progress);
  }

  return { outputIds };
};

export const run: ToolLogicFunction = async (params) => runWordToPdf(params, createQpdfEngine);
