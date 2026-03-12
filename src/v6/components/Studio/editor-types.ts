import { WorkerPdfTextLayerSpan } from '../../../core/public/contracts';
import { FontFamilyId } from './inline-text-utils';

export type TextLayerSpan = WorkerPdfTextLayerSpan;
export type EditorToolId = 'text' | 'sign' | 'annotate' | 'whiteout' | 'shapes' | 'forms' | 'watermark' | 'protect';
export type ShapePreset = 'rectangle' | 'line' | 'arrow';
export type TextAlignId = 'left' | 'center' | 'right';
export type InlineUiState = 'idle' | 'hover' | 'selected' | 'editing' | 'saving' | 'saved' | 'error';

export interface TextElement {
    id: string;
    type: 'text';
    x: number;
    y: number;
    w: number;
    h: number;
    text: string;
    color: string;
    fontSize: number;
    fontFamily: FontFamilyId;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textAlign: TextAlignId;
    lineHeight: number;
    letterSpacing: number;
    opacity: number;
    ascent?: number;
    sourceFontName?: string;
    sourceFontFamilyHint?: string;
    sourceFontSizeRatio?: number;
}

export interface StrokeElement {
    id: string;
    type: 'stroke';
    points: number[];
    paths?: number[][];
    color: string;
    width: number;
    opacity: number;
}

export interface RectElement {
    id: string;
    type: 'rect';
    x: number;
    y: number;
    w: number;
    h: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity: number;
}

export interface ImageElement {
    id: string;
    type: 'image';
    x: number;
    y: number;
    w: number;
    h: number;
    opacity: number;
    dataUrl: string;
    signatureSource?: 'typed' | 'drawn' | 'upload';
    typedSignatureMeta?: {
        baseFontSize: number;
        sourceWidth: number;
        sourceHeight: number;
    };
}

export interface FormFieldElement {
    id: string;
    type: 'form-field';
    formType: 'text' | 'multiline' | 'checkbox' | 'radio' | 'dropdown';
    name: string;
    x: number;
    y: number;
    w: number;
    h: number;
    defaultValue: string;
    options?: string[];
    required: boolean;
    fontSize: number;
    opacity: number;
}

export interface WatermarkElement {
    id: string;
    type: 'watermark';
    x: number;
    y: number;
    w: number;
    h: number;
    text: string;
    color: string;
    fontSize: number;
    fontFamily: FontFamilyId;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    opacity: number;
    rotation: number;
    repeatEnabled: boolean;
    repeatCols: number;
    repeatRows: number;
    repeatGapX: number;
    repeatGapY: number;
}

export type EditElement = TextElement | StrokeElement | RectElement | ImageElement | FormFieldElement | WatermarkElement;

export interface RectDraft {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface StrokeDraft {
    points: number[];
    paths?: number[][];
}

export type DragSession =
    | { mode: 'move-text'; id: string; startClientX: number; startClientY: number; originX: number; originY: number; initialElements: EditElement[]; }
    | { mode: 'resize-text'; id: string; startClientX: number; startClientY: number; originW: number; originH: number; originFontSize: number; initialElements: EditElement[]; }
    | { mode: 'move-rect'; id: string; startClientX: number; startClientY: number; originX: number; originY: number; initialElements: EditElement[]; }
    | { mode: 'resize-rect'; id: string; startClientX: number; startClientY: number; originW: number; originH: number; initialElements: EditElement[]; }
    | { mode: 'move-image'; id: string; startClientX: number; startClientY: number; originX: number; originY: number; originW: number; originH: number; initialElements: EditElement[]; }
    | { mode: 'resize-image'; id: string; startClientX: number; startClientY: number; originW: number; originH: number; originX: number; originY: number; initialElements: EditElement[]; }
    | { mode: 'resize-form-field'; id: string; startClientX: number; startClientY: number; originW: number; originH: number; originX: number; originY: number; initialElements: EditElement[]; }
    | { mode: 'move-watermark'; id: string; startClientX: number; startClientY: number; originX: number; originY: number; initialElements: EditElement[]; }
    | { mode: 'resize-watermark'; id: string; startClientX: number; startClientY: number; originW: number; originH: number; originFontSize: number; originX: number; originY: number; initialElements: EditElement[]; }
    | { mode: 'rotate-watermark'; id: string; centerClientX: number; centerClientY: number; originRotation: number; initialElements: EditElement[]; }
    | { mode: 'move-stroke'; id: string; startClientX: number; startClientY: number; initialPoints: number[]; initialPaths?: number[][]; initialElements: EditElement[]; }
    | { mode: 'resize-stroke'; id: string; startClientX: number; startClientY: number; initialPoints: number[]; bounds: { minX: number; minY: number; maxX: number; maxY: number }; initialElements: EditElement[]; };

export interface TextEditorState {
    id: string;
    value: string;
    initialValue: string;
}
