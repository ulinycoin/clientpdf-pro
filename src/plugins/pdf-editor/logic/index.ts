import type {
  ToolLogicFunction,
  WorkerStudioEditElement,
  WorkerStudioFontFamilyId,
  WorkerStudioTextAlign,
} from '../../../core/types/contracts';
import { getPdfPageCountFromBytes } from '../../../core/pdf/page-count';
import { applyStudioTextEditsToPdfBytes } from '../../../services/pdf/studio-text-edit-applier';

interface PdfEditorRawEdit {
  type?: unknown;
  pageIndex?: unknown;
  text?: unknown;
  xRatio?: unknown;
  yRatio?: unknown;
  widthRatio?: unknown;
  heightRatio?: unknown;
  x1Ratio?: unknown;
  y1Ratio?: unknown;
  x2Ratio?: unknown;
  y2Ratio?: unknown;
  fontSize?: unknown;
  fontFamily?: unknown;
  color?: unknown;
  strokeWidth?: unknown;
  bold?: unknown;
  italic?: unknown;
  opacity?: unknown;
  textAlign?: unknown;
  horizontalScaling?: unknown;
}

interface PreparedPageEdits {
  pageIndex: number;
  elements: WorkerStudioEditElement[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toFiniteNumber(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return value;
}

function normalizeColor(value: unknown): string {
  if (typeof value !== 'string') {
    return '#000000';
  }
  const raw = value.trim().replace(/^#/u, '');
  if (/^[0-9a-fA-F]{3}$/u.test(raw)) {
    return `#${raw
      .split('')
      .map((char) => char + char)
      .join('')
      .toLowerCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/u.test(raw)) {
    return `#${raw.toLowerCase()}`;
  }
  return '#000000';
}

function normalizeTextAlign(value: unknown): WorkerStudioTextAlign {
  if (value === 'center' || value === 'right') {
    return value;
  }
  return 'left';
}

function normalizeFontFamily(value: unknown): WorkerStudioFontFamilyId {
  if (typeof value !== 'string') {
    return 'sora';
  }
  const normalized = value.trim().toLowerCase();
  if (normalized.includes('arabic')) {
    return 'noto-arabic';
  }
  if (normalized.includes('cjk') || normalized.includes('han') || normalized.includes('kana') || normalized.includes('hangul')) {
    return 'noto-cjk';
  }
  if (normalized.includes('devanagari') || normalized.includes('hindi')) {
    return 'noto-devanagari';
  }
  if (normalized.includes('noto')) {
    return 'noto';
  }
  if (normalized.includes('roboto')) {
    return 'roboto';
  }
  if (normalized.includes('times') || normalized.includes('serif')) {
    return 'times';
  }
  if (normalized.includes('mono') || normalized.includes('courier') || normalized.includes('code')) {
    return 'mono';
  }
  return 'sora';
}

function normalizeOpacity(value: unknown): number {
  const numeric = toFiniteNumber(value, 100);
  if (numeric > 1) {
    return clamp(numeric / 100, 0, 1);
  }
  return clamp(numeric, 0, 1);
}

function normalizeHorizontalScaling(value: unknown): number {
  return clamp(toFiniteNumber(value, 1), 0.5, 3);
}

function sanitizeText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/[\r\n]+/gu, ' ').trim();
}

function buildCircleStrokePoints(x: number, y: number, w: number, h: number): number[] {
  const cx = x + (w / 2);
  const cy = y + (h / 2);
  const rx = w / 2;
  const ry = h / 2;
  const segments = 32;
  const points: number[] = [];
  for (let step = 0; step <= segments; step += 1) {
    const angle = (step / segments) * Math.PI * 2;
    points.push(
      clamp(cx + (Math.cos(angle) * rx), 0, 1),
      clamp(cy + (Math.sin(angle) * ry), 0, 1),
    );
  }
  return points;
}

function collectPreparedEdits(options?: Record<string, unknown>): PreparedPageEdits[] {
  const edits = Array.isArray(options?.elements)
    ? options.elements
    : Array.isArray(options?.edits)
      ? options.edits
      : [];
  const grouped = new Map<number, WorkerStudioEditElement[]>();

  for (let index = 0; index < edits.length; index += 1) {
    const candidate = edits[index];
    if (!candidate || typeof candidate !== 'object') {
      continue;
    }
    const raw = candidate as PdfEditorRawEdit;
    const pageIndex = Math.max(0, Math.floor(toFiniteNumber(raw.pageIndex, 0)));
    const type = raw.type === 'line' || raw.type === 'rect' || raw.type === 'whiteout' || raw.type === 'circle' || raw.type === 'text'
      ? raw.type
      : 'text';
    const current = grouped.get(pageIndex) ?? [];

    if (type === 'line') {
      current.push({
        id: `pdf-editor-${pageIndex}-${index}`,
        type: 'stroke',
        points: [
          clamp(toFiniteNumber(raw.x1Ratio, 10) / 100, 0, 1),
          clamp(toFiniteNumber(raw.y1Ratio, 10) / 100, 0, 1),
          clamp(toFiniteNumber(raw.x2Ratio, 30) / 100, 0, 1),
          clamp(toFiniteNumber(raw.y2Ratio, 30) / 100, 0, 1),
        ],
        color: normalizeColor(raw.color),
        width: clamp(toFiniteNumber(raw.strokeWidth, 2), 0.1, 32),
        opacity: normalizeOpacity(raw.opacity),
      });
      grouped.set(pageIndex, current);
      continue;
    }

    if (type === 'rect' || type === 'whiteout' || type === 'circle') {
      const x = clamp(toFiniteNumber(raw.xRatio, 10) / 100, 0, 1);
      const y = clamp(toFiniteNumber(raw.yRatio, 10) / 100, 0, 1);
      const w = clamp(toFiniteNumber(raw.widthRatio, 20) / 100, 0.001, 1);
      const h = clamp(toFiniteNumber(raw.heightRatio, 10) / 100, 0.001, 1);
      const strokeColor = type === 'whiteout' ? '#ffffff' : normalizeColor(raw.color);
      const rawStrokeWidth = clamp(toFiniteNumber(raw.strokeWidth, 2), 0, 32);
      const strokeWidth = type === 'whiteout' ? 0 : rawStrokeWidth;

      if (type === 'circle') {
        current.push({
          id: `pdf-editor-${pageIndex}-${index}`,
          type: 'stroke',
          points: buildCircleStrokePoints(x, y, w, h),
          color: strokeColor,
          width: Math.max(0.1, strokeWidth),
          opacity: normalizeOpacity(raw.opacity),
        });
        grouped.set(pageIndex, current);
        continue;
      }

      current.push({
        id: `pdf-editor-${pageIndex}-${index}`,
        type: 'rect',
        x,
        y,
        w,
        h,
        fill: type === 'whiteout' ? '#ffffff' : 'transparent',
        stroke: strokeColor,
        strokeWidth: type === 'whiteout' ? 0 : strokeWidth,
        opacity: normalizeOpacity(raw.opacity),
      });
      grouped.set(pageIndex, current);
      continue;
    }

    const text = sanitizeText(raw.text);
    if (!text) {
      continue;
    }
    const horizontalScaling = normalizeHorizontalScaling(raw.horizontalScaling);
    current.push({
      id: `pdf-editor-${pageIndex}-${index}`,
      type: 'text',
      x: clamp(toFiniteNumber(raw.xRatio, 10) / 100, 0, 1),
      y: clamp(toFiniteNumber(raw.yRatio, 10) / 100, 0, 1),
      w: clamp(toFiniteNumber(raw.widthRatio, 30) / 100, 0.001, 1),
      h: clamp(toFiniteNumber(raw.heightRatio, 8) / 100, 0.001, 1),
      text,
      color: normalizeColor(raw.color),
      fontSize: clamp(toFiniteNumber(raw.fontSize, 16), 4, 144),
      fontFamily: normalizeFontFamily(raw.fontFamily),
      fontWeight: raw.bold === true ? 'bold' : 'normal',
      fontStyle: raw.italic === true ? 'italic' : 'normal',
      textAlign: normalizeTextAlign(raw.textAlign),
      lineHeight: 1.2,
      letterSpacing: clamp((horizontalScaling - 1) * 3, -2, 20),
      opacity: normalizeOpacity(raw.opacity),
    });
    grouped.set(pageIndex, current);
  }

  return Array.from(grouped.entries())
    .sort((left, right) => left[0] - right[0])
    .map(([pageIndex, elements]) => ({ pageIndex, elements }));
}

export const run: ToolLogicFunction = async ({ inputIds, fs, options, emitProgress }) => {
  if (inputIds.length === 0) {
    throw new Error('PDF Editor requires at least one input file');
  }

  const pageEdits = collectPreparedEdits(options);
  const outputIds: string[] = [];

  for (let inputIndex = 0; inputIndex < inputIds.length; inputIndex += 1) {
    const entry = await fs.read(inputIds[inputIndex]);
    const sourceBlob = await entry.getBlob();
    let outputBytes: Uint8Array = new Uint8Array(await sourceBlob.arrayBuffer());

    if (pageEdits.length > 0) {
      const pageCount = await getPdfPageCountFromBytes(outputBytes, 'application/pdf');
      const applicableEdits = pageEdits.filter((pageEdit) => pageEdit.pageIndex < pageCount);

      if (applicableEdits.length > 0) {
        for (let pageEditIndex = 0; pageEditIndex < applicableEdits.length; pageEditIndex += 1) {
          const pageEdit = applicableEdits[pageEditIndex];
          const applied = await applyStudioTextEditsToPdfBytes({
            sourceBytes: outputBytes,
            pageIndex: pageEdit.pageIndex,
            elements: pageEdit.elements,
          });
          outputBytes = applied.outputBytes;

          const localProgress = (pageEditIndex + 1) / applicableEdits.length;
          const overallProgress = ((inputIndex + localProgress) / inputIds.length) * 100;
          emitProgress?.(Math.round(clamp(overallProgress, 0, 100)));
        }
      }
    }

    const stableBytes = new Uint8Array(outputBytes.byteLength);
    stableBytes.set(outputBytes);
    const outputEntry = await fs.write(new Blob([stableBytes], { type: 'application/pdf' }));
    outputIds.push(outputEntry.id);

    const progress = Math.round(((inputIndex + 1) / inputIds.length) * 100);
    emitProgress?.(progress);
  }

  return { outputIds };
};
