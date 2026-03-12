import type {
  WorkerStudioEditElement,
  WorkerStudioFontFamilyId,
  WorkerStudioFormFieldEditElement,
  WorkerStudioImageEditElement,
  WorkerStudioRectEditElement,
  WorkerStudioStrokeEditElement,
  WorkerStudioTextAlign,
  WorkerStudioTextEditElement,
  WorkerStudioWatermarkEditElement,
} from '../../core/types/contracts';

const MAX_EDIT_ELEMENTS = 2000;
const MAX_TEXT_LENGTH = 20_000;

function fail(message: string, code: string): never {
  const error = new Error(message) as Error & { code?: string };
  error.code = code;
  throw error;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toFiniteNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(`Invalid numeric field: ${field}`, 'STUDIO_EDIT_INVALID_PAYLOAD');
  }
  return value;
}

function toSafeRatio(value: unknown, field: string): number {
  return clamp(toFiniteNumber(value, field), 0, 1);
}

function normalizeOpacity(value: unknown): number {
  return clamp(toFiniteNumber(value, 'opacity'), 0, 1);
}

function normalizeColor(value: unknown): string {
  if (typeof value !== 'string') {
    return '#000000';
  }
  const raw = value.trim().replace(/^#/u, '');
  if (/^[0-9a-fA-F]{3}$/u.test(raw)) {
    const expanded = raw
      .split('')
      .map((char) => char + char)
      .join('')
      .toLowerCase();
    return `#${expanded}`;
  }
  if (/^[0-9a-fA-F]{6}$/u.test(raw)) {
    return `#${raw.toLowerCase()}`;
  }
  return '#000000';
}

function normalizeFillColor(value: unknown): string {
  if (typeof value === 'string' && value.trim().toLowerCase() === 'transparent') {
    return 'transparent';
  }
  return normalizeColor(value);
}

function normalizeTextAlign(value: unknown): WorkerStudioTextAlign {
  return value === 'center' || value === 'right' ? value : 'left';
}

function normalizeFontFamily(value: unknown): WorkerStudioFontFamilyId {
  return value === 'times'
    || value === 'mono'
    || value === 'roboto'
    || value === 'noto'
    || value === 'noto-arabic'
    || value === 'noto-cjk'
    || value === 'noto-devanagari'
    ? value
    : 'sora';
}

function normalizeTextElement(input: WorkerStudioTextEditElement): WorkerStudioTextEditElement {
  if (typeof input.text !== 'string') {
    fail('Invalid text element payload: text must be a string', 'STUDIO_EDIT_INVALID_PAYLOAD');
  }
  const text = input.text.replace(/[\r\n]+/gu, ' ').slice(0, MAX_TEXT_LENGTH);
  return {
    id: typeof input.id === 'string' && input.id.trim().length > 0 ? input.id : crypto.randomUUID(),
    type: 'text',
    x: toSafeRatio(input.x, 'text.x'),
    y: toSafeRatio(input.y, 'text.y'),
    w: clamp(toFiniteNumber(input.w, 'text.w'), 0.001, 1),
    h: clamp(toFiniteNumber(input.h, 'text.h'), 0.001, 1),
    text,
    color: normalizeColor(input.color),
    fontSize: clamp(toFiniteNumber(input.fontSize, 'text.fontSize'), 4, 144),
    fontFamily: normalizeFontFamily(input.fontFamily),
    fontWeight: input.fontWeight === 'bold' ? 'bold' : 'normal',
    fontStyle: input.fontStyle === 'italic' ? 'italic' : 'normal',
    textAlign: normalizeTextAlign(input.textAlign),
    lineHeight: clamp(toFiniteNumber(input.lineHeight ?? 1.2, 'text.lineHeight'), 0.8, 3),
    letterSpacing: clamp(toFiniteNumber(input.letterSpacing ?? 0, 'text.letterSpacing'), -2, 20),
    opacity: normalizeOpacity(input.opacity),
    ascent: typeof input.ascent === 'number' && Number.isFinite(input.ascent)
      ? clamp(input.ascent, 0, 512)
      : undefined,
    sourceFontName: typeof input.sourceFontName === 'string' && input.sourceFontName.trim().length > 0
      ? input.sourceFontName.trim().slice(0, 128)
      : undefined,
    sourceFontFamilyHint: typeof input.sourceFontFamilyHint === 'string' && input.sourceFontFamilyHint.trim().length > 0
      ? input.sourceFontFamilyHint.trim().slice(0, 128)
      : undefined,
    sourceFontSizeRatio: typeof input.sourceFontSizeRatio === 'number' && Number.isFinite(input.sourceFontSizeRatio)
      ? clamp(input.sourceFontSizeRatio, 0.004, 0.25)
      : undefined,
  };
}

function normalizeStrokePoints(points: unknown): number[] {
  if (!Array.isArray(points) || points.length < 4 || points.length % 2 !== 0) {
    fail('Invalid stroke payload: points must be an even array with at least 4 numbers', 'STUDIO_EDIT_INVALID_PAYLOAD');
  }
  return points.map((value, index) => toSafeRatio(value, `stroke.points[${index}]`));
}

function normalizeStrokePaths(paths: unknown): number[][] | undefined {
  if (paths == null) {
    return undefined;
  }
  if (!Array.isArray(paths)) {
    fail('Invalid stroke payload: paths must be an array', 'STUDIO_EDIT_INVALID_PAYLOAD');
  }
  const normalized = paths.map((path, index) => {
    if (!Array.isArray(path) || path.length < 4 || path.length % 2 !== 0) {
      fail(`Invalid stroke payload: paths[${index}] must be an even array with at least 4 numbers`, 'STUDIO_EDIT_INVALID_PAYLOAD');
    }
    return path.map((value, pointIndex) => toSafeRatio(value, `stroke.paths[${index}][${pointIndex}]`));
  });
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeStrokeElement(input: WorkerStudioStrokeEditElement): WorkerStudioStrokeEditElement {
  return {
    id: typeof input.id === 'string' && input.id.trim().length > 0 ? input.id : crypto.randomUUID(),
    type: 'stroke',
    points: normalizeStrokePoints(input.points),
    paths: normalizeStrokePaths(input.paths),
    color: normalizeColor(input.color),
    width: clamp(toFiniteNumber(input.width, 'stroke.width'), 0.1, 64),
    opacity: normalizeOpacity(input.opacity),
  };
}

function normalizeRectElement(input: WorkerStudioRectEditElement): WorkerStudioRectEditElement {
  return {
    id: typeof input.id === 'string' && input.id.trim().length > 0 ? input.id : crypto.randomUUID(),
    type: 'rect',
    x: toSafeRatio(input.x, 'rect.x'),
    y: toSafeRatio(input.y, 'rect.y'),
    w: clamp(toFiniteNumber(input.w, 'rect.w'), 0.001, 1),
    h: clamp(toFiniteNumber(input.h, 'rect.h'), 0.001, 1),
    fill: normalizeFillColor(input.fill),
    stroke: normalizeColor(input.stroke),
    strokeWidth: clamp(toFiniteNumber(input.strokeWidth, 'rect.strokeWidth'), 0, 32),
    opacity: normalizeOpacity(input.opacity),
  };
}

function normalizeImageElement(input: WorkerStudioImageEditElement): WorkerStudioImageEditElement {
  if (typeof input.dataUrl !== 'string') {
    fail('Invalid image payload: dataUrl must be a string', 'STUDIO_EDIT_INVALID_PAYLOAD');
  }
  const normalizedDataUrl = input.dataUrl.trim();
  if (!/^data:image\/(png|jpeg|jpg);base64,[a-z0-9+/=]+$/iu.test(normalizedDataUrl)) {
    fail('Unsupported image payload format', 'STUDIO_EDIT_INVALID_PAYLOAD');
  }
  if (normalizedDataUrl.length > 6_000_000) {
    fail('Image payload is too large', 'STUDIO_EDIT_TOO_LARGE');
  }
  return {
    id: typeof input.id === 'string' && input.id.trim().length > 0 ? input.id : crypto.randomUUID(),
    type: 'image',
    x: toSafeRatio(input.x, 'image.x'),
    y: toSafeRatio(input.y, 'image.y'),
    w: clamp(toFiniteNumber(input.w, 'image.w'), 0.001, 1),
    h: clamp(toFiniteNumber(input.h, 'image.h'), 0.001, 1),
    opacity: normalizeOpacity(input.opacity),
    dataUrl: normalizedDataUrl,
  };
}

function normalizeFormFieldElement(input: WorkerStudioFormFieldEditElement): WorkerStudioFormFieldEditElement {
  const formType = input.formType === 'checkbox'
    || input.formType === 'radio'
    || input.formType === 'multiline'
    || input.formType === 'dropdown'
    ? input.formType
    : 'text';
  const rawDefaultValue = typeof input.defaultValue === 'string' ? input.defaultValue : '';
  const normalizedOptions = formType === 'dropdown'
    ? (Array.isArray(input.options) ? input.options : [])
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 50)
    : undefined;
  return {
    id: typeof input.id === 'string' && input.id.trim().length > 0 ? input.id : crypto.randomUUID(),
    type: 'form-field',
    formType,
    name: typeof input.name === 'string' && input.name.trim().length > 0
      ? input.name.trim().slice(0, 120)
      : undefined,
    x: toSafeRatio(input.x, 'formField.x'),
    y: toSafeRatio(input.y, 'formField.y'),
    w: clamp(toFiniteNumber(input.w, 'formField.w'), 0.001, 1),
    h: clamp(toFiniteNumber(input.h, 'formField.h'), 0.001, 1),
    defaultValue: rawDefaultValue.slice(0, MAX_TEXT_LENGTH),
    options: normalizedOptions,
    required: Boolean(input.required),
    fontSize: clamp(toFiniteNumber(input.fontSize, 'formField.fontSize'), 4, 144),
    opacity: normalizeOpacity(input.opacity),
  };
}

function normalizeWatermarkElement(input: WorkerStudioWatermarkEditElement): WorkerStudioWatermarkEditElement {
  if (typeof input.text !== 'string') {
    fail('Invalid watermark payload: text must be a string', 'STUDIO_EDIT_INVALID_PAYLOAD');
  }
  return {
    id: typeof input.id === 'string' && input.id.trim().length > 0 ? input.id : crypto.randomUUID(),
    type: 'watermark',
    x: toSafeRatio(input.x, 'watermark.x'),
    y: toSafeRatio(input.y, 'watermark.y'),
    w: clamp(toFiniteNumber(input.w, 'watermark.w'), 0.001, 1),
    h: clamp(toFiniteNumber(input.h, 'watermark.h'), 0.001, 1),
    text: input.text.replace(/[\r\n]+/gu, ' ').slice(0, MAX_TEXT_LENGTH),
    color: normalizeColor(input.color),
    fontSize: clamp(toFiniteNumber(input.fontSize, 'watermark.fontSize'), 4, 144),
    fontFamily: normalizeFontFamily(input.fontFamily),
    fontWeight: input.fontWeight === 'bold' ? 'bold' : 'normal',
    fontStyle: input.fontStyle === 'italic' ? 'italic' : 'normal',
    opacity: normalizeOpacity(input.opacity),
    rotation: clamp(toFiniteNumber(input.rotation, 'watermark.rotation'), -180, 180),
    repeatEnabled: Boolean(input.repeatEnabled),
    repeatCols: Math.max(1, Math.min(12, Math.floor(toFiniteNumber(input.repeatCols, 'watermark.repeatCols')))),
    repeatRows: Math.max(1, Math.min(12, Math.floor(toFiniteNumber(input.repeatRows, 'watermark.repeatRows')))),
    repeatGapX: clamp(toFiniteNumber(input.repeatGapX, 'watermark.repeatGapX'), 0, 0.5),
    repeatGapY: clamp(toFiniteNumber(input.repeatGapY, 'watermark.repeatGapY'), 0, 0.5),
  };
}

export function normalizeAndValidateStudioEditRequest(payload: {
  pageIndex: unknown;
  elements: unknown;
}): { pageIndex: number; elements: WorkerStudioEditElement[] } {
  const pageIndexRaw = toFiniteNumber(payload.pageIndex, 'pageIndex');
  const pageIndex = Math.max(0, Math.floor(pageIndexRaw));
  if (!Array.isArray(payload.elements)) {
    fail('Invalid payload: elements must be an array', 'STUDIO_EDIT_INVALID_PAYLOAD');
  }
  if (payload.elements.length > MAX_EDIT_ELEMENTS) {
    fail(`Too many edit elements: ${payload.elements.length}`, 'STUDIO_EDIT_TOO_LARGE');
  }

  const normalized: WorkerStudioEditElement[] = [];
  for (const element of payload.elements) {
    if (!element || typeof element !== 'object' || !('type' in element)) {
      fail('Invalid edit element entry', 'STUDIO_EDIT_INVALID_PAYLOAD');
    }
    const typed = element as WorkerStudioEditElement;
    if (typed.type === 'text') {
      normalized.push(normalizeTextElement(typed));
      continue;
    }
    if (typed.type === 'stroke') {
      normalized.push(normalizeStrokeElement(typed));
      continue;
    }
    if (typed.type === 'rect') {
      normalized.push(normalizeRectElement(typed));
      continue;
    }
    if (typed.type === 'image') {
      normalized.push(normalizeImageElement(typed));
      continue;
    }
    if (typed.type === 'form-field') {
      normalized.push(normalizeFormFieldElement(typed));
      continue;
    }
    if (typed.type === 'watermark') {
      normalized.push(normalizeWatermarkElement(typed));
      continue;
    }
    fail(`Unsupported edit element type: ${(typed as { type: unknown }).type as string}`, 'STUDIO_EDIT_UNSUPPORTED_ELEMENT');
  }
  return { pageIndex, elements: normalized };
}
