import type React from 'react';
import type {
    EditElement,
    TextElement,
    RectDraft,
    StrokeDraft,
    TextLayerSpan,
    TextEditorState,
    EditorToolId,
    ShapePreset,
} from '../editor-types';
import type { FontFamilyId } from '../inline-text-utils';

export interface Point {
    x: number;
    y: number;
}

export interface ToolContext {
    elements: EditElement[];
    applyElements: (next: EditElement[]) => void;
    textLayerSpans: TextLayerSpan[];
    isSelectMode: boolean;
    textSelectionMode: 'line' | 'word';
    textEditor: TextEditorState | null;
    commitTextEditor: () => void;
    startEditingText: (element: TextElement) => void;
    setSelectedElementId: (id: string | null) => void;
    setInlineUiState: (state: any) => void;
    uiMessages: any;

    draftRect: RectDraft | null;
    setDraftRect: (draft: RectDraft | null | ((prev: RectDraft | null) => RectDraft | null)) => void;
    draftStroke: StrokeDraft | null;
    setDraftStroke: (draft: StrokeDraft | null | ((prev: StrokeDraft | null) => StrokeDraft | null)) => void;

    isPointerDown: boolean;
    setIsPointerDown: (val: boolean) => void;
    annotateColor: string;
    annotateMode: 'highlight' | 'pen' | 'shapes';
    annotateStrokeWidth: number;
    shapePreset: ShapePreset;
    shapeColor: string;
    shapeStrokeWidth: number;
    whiteoutColor: string;
    textStyle: {
        fontFamily: FontFamilyId;
        fontSize: number;
        fontWeight: 'normal' | 'bold';
        fontStyle: 'normal' | 'italic';
        lineHeight: number;
        letterSpacing: number;
        color: string;
        backgroundColor: string;
    };
    watermarkOptions: {
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
    };
    signMode: 'type' | 'draw';
    signColor: string;
    signStrokeWidth: number;
    formType?: 'text' | 'multiline' | 'checkbox' | 'radio' | 'dropdown';
}

export interface IEditorTool {
    id: EditorToolId;
    onPointerDown(ctx: ToolContext, event: React.PointerEvent, worldPos: Point): void;
    onPointerMove(ctx: ToolContext, event: React.PointerEvent, worldPos: Point): void;
    onPointerUp(ctx: ToolContext, event: React.PointerEvent, worldPos: Point): void;
}
