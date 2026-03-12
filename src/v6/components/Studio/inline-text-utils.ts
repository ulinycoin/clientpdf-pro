import type { PDFFont } from 'pdf-lib';

export type FontFamilyId =
  | 'sora'
  | 'times'
  | 'mono'
  | 'roboto'
  | 'noto'
  | 'noto-arabic'
  | 'noto-cjk'
  | 'noto-devanagari';

export interface TextLayerSpanLike {
  id: string;
  text: string;
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  fontSizeRatio: number;
  fontName?: string;
  fontFamilyHint?: string;
  pageHeightPt?: number;
  ascentRatio?: number;
}

export interface PointRatio {
  x: number;
  y: number;
}

export interface MergedTextLine {
  left: number;
  top: number;
  width: number;
  height: number;
  text: string;
  fontSizeRatio: number;
  fontName?: string;
  fontFamilyHint?: string;
  pageHeightPt?: number;
  ascentRatio?: number;
}

const FONT_EXACT_MAP: Record<string, FontFamilyId> = {
  helvetica: 'sora',
  arial: 'sora',
  sans: 'sora',
  freesans: 'sora',
  roboto: 'roboto', // Added
  notosans: 'noto',
  notosansarabic: 'noto-arabic',
  notosanscjk: 'noto-cjk',
  notosansdevanagari: 'noto-devanagari',
  timesroman: 'times',
  timesnewroman: 'times',
  times: 'times',
  serif: 'times',
  courier: 'mono',
  couriernew: 'mono',
  mono: 'mono',
  monospace: 'mono',
};

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function normalizeFontName(fontName?: string | null): string {
  if (!fontName) {
    return '';
  }
  const normalized = fontName.trim().replace(/^[A-Z]{6}\+/u, '').toLowerCase();
  return normalized.replace(/[^a-z0-9]+/gu, '');
}

export function resolveFontFamily(fontName?: string, fontFamilyHint?: string): FontFamilyId {
  const candidates = [normalizeFontName(fontName), normalizeFontName(fontFamilyHint)].filter(Boolean);

  for (const candidate of candidates) {
    if (FONT_EXACT_MAP[candidate]) {
      return FONT_EXACT_MAP[candidate];
    }
    if (candidate.includes('roboto')) { // Added
      return 'roboto';
    }
    if (candidate.includes('arabic')) {
      return 'noto-arabic';
    }
    if (
      candidate.includes('cjk')
      || candidate.includes('han')
      || candidate.includes('kana')
      || candidate.includes('hangul')
      || candidate.includes('notosanssc')
      || candidate.includes('notosansjp')
      || candidate.includes('notosanskr')
    ) {
      return 'noto-cjk';
    }
    if (candidate.includes('devanagari') || candidate.includes('hindi')) {
      return 'noto-devanagari';
    }
    if (candidate.includes('noto')) {
      return 'noto';
    }
    if (candidate.includes('courier') || candidate.includes('mono') || candidate.includes('code')) {
      return 'mono';
    }
    if (candidate.includes('times') || (candidate.includes('serif') && !candidate.includes('sans'))) {
      return 'times';
    }
    if (candidate.includes('helvetica') || candidate.includes('arial') || candidate.includes('sans')) {
      return 'sora';
    }
  }

  return 'sora';
}

export function sanitizeInlineText(value: string): string {
  // Remove null characters and other problematic controls, normalize newlines to spaces
  return value.replace(/\0/g, '').replace(/[\r\n]+/gu, ' ');
}

function distanceToRect(point: PointRatio, span: TextLayerSpanLike): number {
  const left = span.xRatio;
  const right = span.xRatio + span.widthRatio;
  const top = span.yRatio;
  const bottom = span.yRatio + span.heightRatio;

  const dx = point.x < left ? left - point.x : point.x > right ? point.x - right : 0;
  const dy = point.y < top ? top - point.y : point.y > bottom ? point.y - bottom : 0;
  return Math.hypot(dx, dy);
}

export function findNearestTextSpan(
  point: PointRatio,
  spans: TextLayerSpanLike[],
  maxDistance = 0.018,
): TextLayerSpanLike | null {
  let best: TextLayerSpanLike | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const span of spans) {
    const distance = distanceToRect(point, span);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = span;
    }
  }

  if (!best || bestDistance > maxDistance) {
    return null;
  }

  return best;
}

export function mergeTextLine(spans: TextLayerSpanLike[], anchor: TextLayerSpanLike): MergedTextLine | null {
  const lineThreshold = Math.max(0.0025, anchor.heightRatio * 0.4);
  const anchorBaseline = anchor.yRatio + (anchor.ascentRatio ?? anchor.heightRatio * 0.8);

  const lineSpans = spans
    .filter((candidate) => {
      const candidateBaseline = candidate.yRatio + (candidate.ascentRatio ?? candidate.heightRatio * 0.8);
      // Group by baseline if both have it, otherwise fallback to top/bottom match
      const baselineMatch = Math.abs(candidateBaseline - anchorBaseline) <= lineThreshold;
      const topMatch = Math.abs(candidate.yRatio - anchor.yRatio) <= lineThreshold;
      const bottomMatch = Math.abs((candidate.yRatio + candidate.heightRatio) - (anchor.yRatio + anchor.heightRatio)) <= lineThreshold;

      return baselineMatch || (topMatch && bottomMatch);
    })
    .sort((a, b) => a.xRatio - b.xRatio);

  if (lineSpans.length === 0) {
    return null;
  }

  // Keep only the contiguous cluster around the clicked anchor span.
  // This avoids accidental horizontal duplication when the same baseline
  // contains old/new text runs after previous saves.
  const anchorIndexById = lineSpans.findIndex((item) => item.id === anchor.id);
  let anchorIndex = anchorIndexById;
  if (anchorIndex < 0) {
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < lineSpans.length; i += 1) {
      const item = lineSpans[i];
      const dx = (item.xRatio + item.widthRatio / 2) - (anchor.xRatio + anchor.widthRatio / 2);
      const dy = (item.yRatio + item.heightRatio / 2) - (anchor.yRatio + anchor.heightRatio / 2);
      const distance = Math.hypot(dx, dy);
      if (distance < bestDistance) {
        bestDistance = distance;
        anchorIndex = i;
      }
    }
  }
  if (anchorIndex < 0) {
    return null;
  }

  // Keep cluster join threshold conservative: duplicated shifted text runs
  // after repeated save cycles often start after a moderate horizontal gap.
  const clusterGapThreshold = Math.max(0.012, anchor.heightRatio * 0.9);
  let start = anchorIndex;
  let end = anchorIndex;

  while (start > 0) {
    const prev = lineSpans[start - 1];
    const curr = lineSpans[start];
    const gap = curr.xRatio - (prev.xRatio + prev.widthRatio);
    if (gap > clusterGapThreshold) {
      break;
    }
    start -= 1;
  }

  while (end < lineSpans.length - 1) {
    const curr = lineSpans[end];
    const next = lineSpans[end + 1];
    const gap = next.xRatio - (curr.xRatio + curr.widthRatio);
    if (gap > clusterGapThreshold) {
      break;
    }
    end += 1;
  }

  const mergedCluster = lineSpans.slice(start, end + 1);

  const left = Math.min(...mergedCluster.map((item) => item.xRatio));
  const top = Math.min(...mergedCluster.map((item) => item.yRatio));
  const right = Math.max(...mergedCluster.map((item) => item.xRatio + item.widthRatio));
  const bottom = Math.max(...mergedCluster.map((item) => item.yRatio + item.heightRatio));

  let mergedText = '';
  const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const firstTokenOf = (value: string): string => {
    const token = value.trim().split(/\s+/u)[0] ?? '';
    return token.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
  };
  let firstMergedToken = '';
  for (let i = 0; i < mergedCluster.length; i += 1) {
    const current = mergedCluster[i];
    if (i > 0) {
      const prev = mergedCluster[i - 1];
      const restartGapThreshold = Math.max(0.01, current.heightRatio * 0.55);
      const gap = current.xRatio - (prev.xRatio + prev.widthRatio);
      const currentToken = firstTokenOf(current.text);
      // Some PDFs keep an old line and append a shifted duplicate line after save.
      // If we detect a clear restart of the line after a noticeable gap, stop at first run.
      if (gap > restartGapThreshold && firstMergedToken && currentToken && currentToken === firstMergedToken) {
        break;
      }
      // Additional protection for repeated shifted runs after multiple edit/save cycles:
      // if the next chunk starts with a token already present in the merged text,
      // treat it as a restarted duplicate line.
      if (gap > restartGapThreshold && currentToken.length >= 3 && mergedText.trim().length >= 8) {
        const tokenRegex = new RegExp(`(^|\\s)${escapeRegex(currentToken)}(\\s|$)`, 'iu');
        if (tokenRegex.test(mergedText.toLowerCase())) {
          break;
        }
      }
    }
    if (i > 0) {
      const prev = mergedCluster[i - 1];
      const gap = current.xRatio - (prev.xRatio + prev.widthRatio);
      // Improved gap detection: if the gap is significantly larger than typical space
      if (gap > Math.max(0.0015, current.heightRatio * 0.15)) {
        if (!mergedText.endsWith(' ') && !current.text.startsWith(' ')) {
          // If gap is very large (e.g. 2+ character widths), maybe we should add more spaces?
          // For now, at least ensure one space is there.
          mergedText += ' ';
        }
      }
    }
    mergedText += current.text;
    if (!firstMergedToken) {
      firstMergedToken = firstTokenOf(mergedText);
    }
  }

  const text = mergedText.replace(/\s+/gu, ' ').trim();
  if (!text) {
    return null;
  }

  const fontSizeRatio = mergedCluster.reduce((acc, current) => Math.max(acc, current.fontSizeRatio), anchor.fontSizeRatio);

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
    text,
    fontSizeRatio,
    fontName: anchor.fontName,
    fontFamilyHint: anchor.fontFamilyHint,
    pageHeightPt: anchor.pageHeightPt,
    ascentRatio: anchor.ascentRatio,
  };
}

export function estimateInlineFontSizePt(fontSizeRatio: number, pageHeightPt: number): number {
  const size = fontSizeRatio * pageHeightPt;
  return Number(clamp(size, 8, 96).toFixed(2));
}

function measureTextWidthWithTracking(font: PDFFont, text: string, fontSize: number, tracking: number): number {
  if (!text) {
    return 0;
  }
  return font.widthOfTextAtSize(text, fontSize) + tracking * Math.max(0, text.length - 1);
}

export interface FittedTextLayout {
  fontSize: number;
  tracking: number;
  overflow: boolean;
}

export function fitTextToWidth(
  font: PDFFont,
  text: string,
  targetWidth: number,
  preferredFontSize: number,
  minFontSize = 8,
): FittedTextLayout {
  const safeText = text || ' ';
  let fontSize = preferredFontSize;
  let tracking = 0;

  const fitAtSize = (size: number) => {
    const baseWidth = font.widthOfTextAtSize(safeText, size);
    // Add a small 2% tolerance to targetWidth to prevent aggressive compression
    // when the browser's rendered width slightly exceeds the PDF-computed width.
    const effectiveTargetWidth = targetWidth * 1.02;

    if (baseWidth <= effectiveTargetWidth || safeText.length <= 1) {
      return { size, tracking: 0, width: baseWidth };
    }
    const minTracking = -0.05 * size; // Less aggressive negative tracking limit
    const neededTracking = (effectiveTargetWidth - baseWidth) / (safeText.length - 1);
    const nextTracking = clamp(neededTracking, minTracking, 0);
    const width = measureTextWidthWithTracking(font, safeText, size, nextTracking);
    return { size, tracking: nextTracking, width };
  };

  let fitted = fitAtSize(fontSize);
  // Compare against effective target width for overflow loop too
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
