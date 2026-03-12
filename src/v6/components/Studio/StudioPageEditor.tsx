import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { PageItem, StudioEditToolId } from './studio-store';
import {
    clamp,
    sanitizeInlineText,
    type FontFamilyId,
} from './inline-text-utils';
import { getStudioEditMessages } from './studio-edit-i18n';
import { clamp01, getStrokeBounds, moveStrokePoints } from '../../utils/studio-edit-math';
import {
    EditElement,
    ImageElement,
    ShapePreset,
    TextElement,
    WatermarkElement,
    RectDraft,
    StrokeDraft,
    DragSession,
    TextEditorState,
    InlineUiState,
    TextLayerSpan
} from './editor-types';
import { TOOLS, ToolContext } from './tools';
import { finalizeAnnotatePenDraft, hasAnnotatePenDraft } from './tools/AnnotateTool';
import { finalizeSignatureDraft, hasSignatureDraft } from './tools/SignTool';

export interface StudioPageEditorHandle {
    commitPendingSignDraft: () => boolean;
    clearPendingSignDraft: () => void;
    commitPendingAnnotatePenDraft: () => boolean;
    clearPendingAnnotatePenDraft: () => void;
}

export interface StudioPageEditorProps {
    page: PageItem;
    width: number;
    height: number;
    activeTool?: StudioEditToolId | null;
    elements: EditElement[];
    onElementsChange: (elements: EditElement[]) => void;
    onPushHistory?: (elements: EditElement[]) => void;

    // Lifted state for integration with external wrappers (like StudioEditWorkspace)
    selectedElementId?: string | null;
    onSelectedElementIdChange?: (id: string | null) => void;
    textEditor?: TextEditorState | null;
    onTextEditorChange?: (state: TextEditorState | null) => void;
    onInlineUiStateChange?: (state: InlineUiState) => void;
    onMessageChange?: (msg: string | null) => void;
    onActiveToolChange?: (tool: StudioEditToolId) => void;
    isSelectMode: boolean;
    setIsSelectMode: (val: boolean) => void;
    textSelectionMode?: 'line' | 'word';
    onTextSelectionModeChange?: (_mode: 'line' | 'word') => void;
    annotateColor?: string;
    annotateMode?: 'highlight' | 'pen' | 'shapes';
    annotateStrokeWidth?: number;
    signMode?: 'type' | 'draw';
    signColor?: string;
    signStrokeWidth?: number;
    onPendingSignDraftChange?: (hasDraft: boolean) => void;
    onPendingAnnotatePenDraftChange?: (hasDraft: boolean) => void;
    shapePreset?: ShapePreset;
    shapeColor?: string;
    shapeStrokeWidth?: number;
    whiteoutColor?: string;
    textStyle?: {
        fontFamily: FontFamilyId;
        fontSize: number;
        fontWeight: 'normal' | 'bold';
        fontStyle: 'normal' | 'italic';
        lineHeight: number;
        letterSpacing: number;
        color: string;
        backgroundColor: string;
    };
    watermarkOptions?: {
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
    textLayerSpans: TextLayerSpan[];
    onFinish?: () => void;
    onDiscard?: () => void;
}

export const StudioPageEditor = forwardRef<StudioPageEditorHandle, StudioPageEditorProps>(function StudioPageEditor({
    page: _page,
    width,
    height,
    activeTool: externalActiveTool = null,
    elements,
    onElementsChange,
    onPushHistory,
    selectedElementId: externalSelectedElementId,
    onSelectedElementIdChange,
    textEditor: externalTextEditor,
    onTextEditorChange,
    onInlineUiStateChange,
    onMessageChange: _onMessageChange,
    onActiveToolChange: _onActiveToolChange,
    isSelectMode,
    setIsSelectMode: _setIsSelectMode,
    textSelectionMode: externalTextSelectionMode,
    onTextSelectionModeChange: _onTextSelectionModeChange,
    annotateColor = '#fff176',
    annotateMode = 'highlight',
    annotateStrokeWidth = 5,
    signMode = 'type',
    signColor = '#111827',
    signStrokeWidth = 3,
    onPendingSignDraftChange,
    onPendingAnnotatePenDraftChange,
    shapePreset = 'rectangle',
    shapeColor = '#2563eb',
    shapeStrokeWidth = 2,
    whiteoutColor = '#ffffff',
    textStyle = {
        fontFamily: 'sora',
        fontSize: 18,
        fontWeight: 'normal',
        fontStyle: 'normal',
        lineHeight: 1.2,
        letterSpacing: 0,
        color: '#0f172a',
        backgroundColor: '#ffffff'
    },
    watermarkOptions = {
        text: 'CONFIDENTIAL',
        color: '#1e293b',
        fontSize: 30,
        fontFamily: 'sora',
        fontWeight: 'bold',
        fontStyle: 'normal',
        opacity: 0.32,
        rotation: -30,
        repeatEnabled: true,
        repeatCols: 3,
        repeatRows: 4,
        repeatGapX: 0.2,
        repeatGapY: 0.16,
    },
    textLayerSpans,
    onFinish: _onFinish,
    onDiscard: _onDiscard
}: StudioPageEditorProps, ref) {
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const dragSessionRef = useRef<DragSession | null>(null);

    const [internalSelectedElementId, setInternalSelectedElementId] = useState<string | null>(null);
    const selectedElementId = externalSelectedElementId !== undefined ? externalSelectedElementId : internalSelectedElementId;
    const setSelectedElementId = (id: string | null) => {
        if (onSelectedElementIdChange) onSelectedElementIdChange(id);
        else setInternalSelectedElementId(id);
    };

    const [internalTextEditor, setInternalTextEditor] = useState<TextEditorState | null>(null);
    const textEditor = externalTextEditor !== undefined ? externalTextEditor : internalTextEditor;
    const setTextEditor = useCallback((next: TextEditorState | null | ((prev: TextEditorState | null) => TextEditorState | null)) => {
        const resolved = typeof next === 'function' ? next(textEditor) : next;
        if (onTextEditorChange) onTextEditorChange(resolved);
        else setInternalTextEditor(resolved);
    }, [onTextEditorChange, textEditor]);

    const [inlineUiState, setInlineUiState] = useState<InlineUiState>('idle');

    useEffect(() => {
        if (onInlineUiStateChange) onInlineUiStateChange(inlineUiState);
    }, [inlineUiState, onInlineUiStateChange]);

    const [isPointerDown, setIsPointerDown] = useState(false);
    const [draftRect, setDraftRect] = useState<RectDraft | null>(null);
    const [draftStroke, setDraftStroke] = useState<StrokeDraft | null>(null);

    const textSelectionMode = externalTextSelectionMode ?? 'line';
    const activeTool = externalActiveTool;
    const hasPendingSignDraft = activeTool === 'sign' && signMode === 'draw' && hasSignatureDraft(draftStroke);
    const hasPendingAnnotatePenDraft = activeTool === 'annotate' && annotateMode === 'pen' && hasAnnotatePenDraft(draftStroke);
    const isPenModeActive = (activeTool === 'annotate' && annotateMode === 'pen') || (activeTool === 'sign' && signMode === 'draw');

    const ui = useMemo(() => getStudioEditMessages(), []);


    const applyElements = useCallback((next: EditElement[], shouldPushHistory = true) => {
        onElementsChange(next);
        if (shouldPushHistory && onPushHistory) {
            onPushHistory(next);
        }
    }, [onElementsChange, onPushHistory]);

    const commitTextEditor = useCallback(() => {
        if (!textEditor) return;
        if (textEditor.value !== textEditor.initialValue) {
            applyElements(elements, true);
        }
        setTextEditor(null);
        setInlineUiState(selectedElementId ? 'selected' : 'idle');
    }, [applyElements, elements, selectedElementId, textEditor]);

    const startEditingText = useCallback((element: TextElement) => {
        setSelectedElementId(element.id);
        setInlineUiState('editing');
        setTextEditor({ id: element.id, value: element.text, initialValue: element.text });
    }, []);

    const handleTextEditorChange = useCallback((id: string, value: string) => {
        const normalizedValue = sanitizeInlineText(value);
        setTextEditor((prev: TextEditorState | null) => prev?.id === id ? { ...prev, value: normalizedValue } : prev);
        applyElements(elements.map(item => (item.id === id && item.type === 'text') ? { ...item, text: normalizedValue } : item), false);
    }, [applyElements, elements]);

    const buildToolContext = (): ToolContext => ({
        elements,
        applyElements,
        textLayerSpans,
        isSelectMode,
        textSelectionMode,
        textEditor,
        commitTextEditor,
        startEditingText,
        setSelectedElementId,
        setInlineUiState,
        uiMessages: ui,
        draftRect,
        setDraftRect,
        draftStroke,
        setDraftStroke,
        isPointerDown,
        setIsPointerDown,
        annotateColor,
        annotateMode,
        annotateStrokeWidth,
        shapePreset,
        shapeColor,
        shapeStrokeWidth,
        whiteoutColor,
        textStyle,
        watermarkOptions,
        signMode,
        signColor,
        signStrokeWidth,
    });

    const commitPendingSignDraft = useCallback(() => finalizeSignatureDraft({
        draft: draftStroke,
        color: signColor,
        strokeWidth: signStrokeWidth,
        elements,
        applyElements,
        setSelectedElementId,
        setInlineUiState,
        setDraftStroke,
    }), [applyElements, draftStroke, elements, setSelectedElementId, signColor, signStrokeWidth]);

    const clearPendingSignDraft = useCallback(() => {
        setDraftStroke(null);
        setInlineUiState(selectedElementId ? 'selected' : 'idle');
    }, [selectedElementId]);

    const commitPendingAnnotatePenDraft = useCallback(() => finalizeAnnotatePenDraft({
        draft: draftStroke,
        color: annotateColor,
        width: annotateStrokeWidth,
        elements,
        applyElements,
        setSelectedElementId,
        setInlineUiState,
        setDraftStroke,
    }), [annotateColor, annotateStrokeWidth, applyElements, draftStroke, elements, setSelectedElementId]);

    const clearPendingAnnotatePenDraft = useCallback(() => {
        setDraftStroke(null);
        setInlineUiState(selectedElementId ? 'selected' : 'idle');
    }, [selectedElementId]);

    useImperativeHandle(ref, () => ({
        commitPendingSignDraft,
        clearPendingSignDraft,
        commitPendingAnnotatePenDraft,
        clearPendingAnnotatePenDraft,
    }), [clearPendingAnnotatePenDraft, clearPendingSignDraft, commitPendingAnnotatePenDraft, commitPendingSignDraft]);

    useEffect(() => {
        onPendingSignDraftChange?.(hasPendingSignDraft);
    }, [hasPendingSignDraft, onPendingSignDraftChange]);

    useEffect(() => {
        onPendingAnnotatePenDraftChange?.(hasPendingAnnotatePenDraft);
    }, [hasPendingAnnotatePenDraft, onPendingAnnotatePenDraftChange]);

    // Pointer Handlers
    const onCanvasPointerDown = (event: React.PointerEvent) => {
        if (!activeTool) {
            return;
        }
        const rect = canvasRef.current!.getBoundingClientRect();
        const worldPos = {
            x: clamp01((event.clientX - rect.left) / rect.width),
            y: clamp01((event.clientY - rect.top) / rect.height)
        };
        const tool = TOOLS[activeTool];
        tool.onPointerDown(buildToolContext(), event, worldPos);
    };

    const onCanvasPointerMove = (event: React.PointerEvent) => {
        if (!activeTool) {
            return;
        }
        const rect = canvasRef.current!.getBoundingClientRect();
        const worldPos = {
            x: clamp01((event.clientX - rect.left) / rect.width),
            y: clamp01((event.clientY - rect.top) / rect.height)
        };
        const tool = TOOLS[activeTool];
        tool.onPointerMove(buildToolContext(), event, worldPos);
    };

    const onCanvasPointerUp = (event: React.PointerEvent) => {
        if (!activeTool) {
            return;
        }
        const rect = canvasRef.current!.getBoundingClientRect();
        const worldPos = {
            x: clamp01((event.clientX - rect.left) / rect.width),
            y: clamp01((event.clientY - rect.top) / rect.height)
        };
        const tool = TOOLS[activeTool];
        tool.onPointerUp(buildToolContext(), event, worldPos);
    };

    const handleElementAction = (id: string, action: 'delete' | 'duplicate' | 'update', patch?: any) => {
        if (action === 'delete') {
            applyElements(elements.filter(el => el.id !== id));
            setSelectedElementId(null);
        } else if (action === 'duplicate') {
            const el = elements.find(e => e.id === id);
            if (el) {
                const nextX = ('x' in el) ? el.x + 0.02 : 0;
                const nextY = ('y' in el) ? el.y + 0.02 : 0;
                applyElements([...elements, { ...el, id: crypto.randomUUID(), ...(('x' in el) ? { x: nextX, y: nextY } : {}) } as EditElement]);
            }
        } else if (action === 'update' && patch) {
            applyElements(elements.map(el => el.id === id ? { ...el, ...patch } : el));
        }
    };

    const textLayerNodes = useMemo(() => {
        return textLayerSpans.map((span, idx) => (
            <div
                key={`span-${idx}`}
                className="studio-edit-text-highlight"
                data-testid="studio-edit-text-highlight"
                style={{
                    position: 'absolute',
                    left: `${span.xRatio * 100}%`,
                    top: `${span.yRatio * 100}%`,
                    width: `${span.widthRatio * 100}%`,
                    height: `${span.heightRatio * 100}%`,
                    border: isSelectMode ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                    backgroundColor: isSelectMode ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    pointerEvents: isSelectMode ? 'auto' : 'none',
                    zIndex: 100,
                    visibility: (isSelectMode || textLayerSpans.length > 0) ? 'visible' : 'hidden',
                    opacity: isSelectMode ? 1 : 0.01 // Minimal opacity for "visibility" but hidden to users
                }}
            />
        ));
    }, [textLayerSpans, isSelectMode]);

    const toCssFontFamily = (fontFamily: FontFamilyId): string => {
        if (fontFamily === 'times') return '"Times New Roman", Times, serif';
        if (fontFamily === 'mono') return '"Courier New", Courier, monospace';
        if (fontFamily === 'roboto') return 'Roboto, "Noto Sans", Arial, sans-serif';
        if (fontFamily === 'noto') return '"Noto Sans", Roboto, Arial, sans-serif';
        if (fontFamily === 'noto-arabic') return '"Noto Sans Arabic", "Noto Naskh Arabic", "Noto Sans", serif';
        if (fontFamily === 'noto-cjk') return '"Noto Sans CJK SC", "Noto Sans SC", "Noto Sans JP", "Noto Sans KR", "Noto Sans", sans-serif';
        if (fontFamily === 'noto-devanagari') return '"Noto Sans Devanagari", "Noto Sans", sans-serif';
        return 'Helvetica, Arial, sans-serif';
    };

    return (
        <div
            ref={canvasRef}
            className="studio-page-editor-container studio-edit-canvas-content"
            style={{ width, height, position: 'relative' }}
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={onCanvasPointerUp}
            data-is-select-mode={isSelectMode}
            data-text-layer-len={textLayerSpans.length}
        >

            {/* Built-in Toolbar (Moved to StudioEditWorkspace) */}




            {/* Render Elements */}
            {elements.map((el) => {
                const strokePaths = el.type === 'stroke' ? [...(el.paths ?? []), el.points] : [];
                const strokeBounds = el.type === 'stroke' ? getStrokeBounds(strokePaths.flat()) : null;
                // Add padding to ensure stroke width fits inside the SVG viewBox and it never collapses to 0 height
                const paddingLimit = el.type === 'stroke' ? ((el.width ?? 0) / Math.max(width, height)) * 1.5 : 0;
                const strokeWidth = strokeBounds ? Math.max(paddingLimit, strokeBounds.maxX - strokeBounds.minX + paddingLimit * 2) : 0;
                const strokeHeight = strokeBounds ? Math.max(paddingLimit, strokeBounds.maxY - strokeBounds.minY + paddingLimit * 2) : 0;

                return (
                    <div
                        key={el.id}
                        data-editor-element-id={el.id}
                        className={`studio-editor-element ${selectedElementId === el.id ? 'selected' : ''}`}
                        style={{
                            position: 'absolute',
                            left: el.type === 'stroke'
                                ? `${((strokeBounds?.minX ?? 0) - paddingLimit) * 100}%`
                                : (el.type === 'watermark' && el.repeatEnabled
                                    ? '0'
                                    : (('x' in el) ? `${el.x * 100}%` : '0')),
                            top: el.type === 'stroke'
                                ? `${((strokeBounds?.minY ?? 0) - paddingLimit) * 100}%`
                                : (el.type === 'watermark' && el.repeatEnabled
                                    ? '0'
                                    : (('y' in el) ? `${el.y * 100}%` : '0')),
                            width: el.type === 'stroke'
                                ? `${strokeWidth * 100}%`
                                : (el.type === 'watermark' && el.repeatEnabled
                                    ? '100%'
                                    : ((textEditor?.id === el.id) ? 'auto' : (('w' in el) ? `${el.w * 100}%` : 'auto'))),
                            minWidth: (textEditor?.id === el.id && 'w' in el) ? `${el.w * 100}%` : 'auto',
                            maxWidth: (textEditor?.id === el.id) ? '90%' : 'none',
                            height: el.type === 'stroke'
                                ? `${strokeHeight * 100}%`
                                : (el.type === 'watermark' && el.repeatEnabled
                                    ? '100%'
                                    : (('h' in el) ? `${el.h * 100}%` : 'auto')),
                            pointerEvents: 'auto',
                            zIndex: selectedElementId === el.id ? 1001 : 1,
                        }}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            setSelectedElementId(el.id);
                            const isActiveTextEditor = textEditor?.id === el.id && el.type === 'text';
                            if (isActiveTextEditor) {
                                return;
                            }
                            e.preventDefault();
                            if (!textEditor || textEditor.id !== el.id) {
                                dragSessionRef.current = {
                                    mode: el.type === 'text'
                                        ? 'move-text'
                                        : (el.type === 'watermark'
                                            ? 'move-watermark'
                                                : (el.type === 'image'
                                                ? 'move-image'
                                                : (el.type === 'rect' || el.type === 'form-field' ? 'move-rect' : 'move-stroke'))),
                                    id: el.id,
                                    startClientX: e.clientX,
                                    startClientY: e.clientY,
                                    originX: ('x' in el) ? el.x : 0,
                                    originY: ('y' in el) ? el.y : 0,
                                    ...(el.type === 'image' ? { originW: el.w, originH: el.h } : {}),
                                    ...(el.type === 'stroke' ? { initialPoints: el.points, initialPaths: el.paths ?? [] } : {}),
                                    initialElements: elements
                                } as DragSession;
                                try {
                                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                                } catch (err) { }
                            }
                        }}
                        onDoubleClick={(e) => {
                            if (el.type !== 'text') {
                                return;
                            }
                            e.stopPropagation();
                            startEditingText(el as TextElement);
                        }}
                        onPointerMove={(e) => {
                            const sess = dragSessionRef.current as any;
                            if (sess && sess.id === el.id && sess.mode === 'move-stroke' && el.type === 'stroke') {
                                const dx = (e.clientX - sess.startClientX) / width;
                                const dy = (e.clientY - sess.startClientY) / height;
                                handleElementAction(el.id, 'update', {
                                    points: moveStrokePoints(sess.initialPoints ?? el.points, dx, dy),
                                    paths: (sess.initialPaths ?? el.paths ?? []).map((path: number[]) => moveStrokePoints(path, dx, dy)),
                                });
                            } else if (sess && sess.id === el.id && sess.mode === 'move-image' && el.type === 'image') {
                                const dx = (e.clientX - sess.startClientX) / width;
                                const dy = (e.clientY - sess.startClientY) / height;
                                const maxX = Math.max(0, 1 - sess.originW);
                                const maxY = Math.max(0, 1 - sess.originH);
                                const nextX = clamp(sess.originX + dx, 0, maxX);
                                const nextY = clamp(sess.originY + dy, 0, maxY);
                                handleElementAction(el.id, 'update', {
                                    x: nextX,
                                    y: nextY,
                                });
                            } else if (sess && sess.id === el.id && sess.mode.startsWith('move-')) {
                                const dx = (e.clientX - sess.startClientX) / width;
                                const dy = (e.clientY - sess.startClientY) / height;
                                const nextX = clamp01(sess.originX + dx);
                                const nextY = clamp01(sess.originY + dy);
                                handleElementAction(el.id, 'update', {
                                    x: nextX,
                                    y: nextY
                                });
                            } else if (sess && sess.id === el.id && sess.mode === 'rotate-watermark' && el.type === 'watermark') {
                                const angleRad = Math.atan2(e.clientY - sess.centerClientY, e.clientX - sess.centerClientX);
                                const angleDeg = (angleRad * 180) / Math.PI;
                                handleElementAction(el.id, 'update', { rotation: angleDeg });
                            } else if (sess && sess.id === el.id && sess.mode === 'resize-image') {
                                const dx = (e.clientX - sess.startClientX) / width;
                                const minW = 0.04;
                                const minH = 0.02;
                                const aspect = Math.max(0.05, sess.originW / Math.max(0.01, sess.originH));
                                const maxW = Math.max(minW, 1 - sess.originX);
                                const maxH = Math.max(minH, 1 - sess.originY);

                                let nextW = clamp(sess.originW + dx, minW, maxW);
                                let nextH = nextW / aspect;
                                if (nextH > maxH) {
                                    nextH = maxH;
                                    nextW = nextH * aspect;
                                }
                                if (nextH < minH) {
                                    nextH = minH;
                                    nextW = nextH * aspect;
                                }
                                if (nextW > maxW) {
                                    nextW = maxW;
                                    nextH = nextW / aspect;
                                }
                                handleElementAction(el.id, 'update', { w: nextW, h: nextH });
                            } else if (sess && sess.id === el.id && sess.mode === 'resize-form-field') {
                                const dx = (e.clientX - sess.startClientX) / width;
                                const dy = (e.clientY - sess.startClientY) / height;
                                const minW = 0.02;
                                const minH = 0.02;
                                const maxW = Math.max(minW, 1 - sess.originX);
                                const maxH = Math.max(minH, 1 - sess.originY);
                                const nextW = clamp(sess.originW + dx, minW, maxW);
                                const nextH = clamp(sess.originH + dy, minH, maxH);
                                handleElementAction(el.id, 'update', { w: nextW, h: nextH });
                            } else if (sess && sess.id === el.id && sess.mode === 'resize-watermark' && el.type === 'watermark') {
                                const dx = (e.clientX - sess.startClientX) / width;
                                const dy = (e.clientY - sess.startClientY) / height;
                                const scale = clamp(1 + Math.max(dx, dy) * 1.6, 0.3, 5);
                                const nextW = clamp(sess.originW * scale, 0.08, 0.95);
                                const nextH = clamp(sess.originH * scale, 0.02, 0.4);
                                const nextFontSize = clamp(sess.originFontSize * scale, 8, 144);
                                handleElementAction(el.id, 'update', {
                                    w: nextW,
                                    h: nextH,
                                    fontSize: nextFontSize,
                                });
                            } else if (sess && sess.id === el.id && sess.mode === 'resize-text') {
                                const dx = (e.clientX - sess.startClientX) / width;
                                const dy = (e.clientY - sess.startClientY) / height;
                                const delta = Math.max(dx, dy);
                                const scale = clamp(1 + delta * 1.6, 0.45, 4);
                                const nextW = clamp(sess.originW * scale, 0.05, 0.95);
                                const nextH = clamp(sess.originH * scale, 0.02, 0.6);
                                const nextFontSize = clamp(sess.originFontSize * scale, 8, 144);
                                handleElementAction(el.id, 'update', {
                                    w: nextW,
                                    h: nextH,
                                    fontSize: nextFontSize,
                                });
                            }
                        }}
                        onPointerUp={(e) => {
                            if (dragSessionRef.current && dragSessionRef.current.id === el.id) {
                                dragSessionRef.current = null;
                                try {
                                    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                                } catch (err) { }
                            }
                        }}
                        onPointerCancel={(e) => {
                            if (dragSessionRef.current && dragSessionRef.current.id === el.id) {
                                dragSessionRef.current = null;
                                try {
                                    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                                } catch (err) { }
                            }
                        }}
                    >
                        {el.type === 'text' && (
                            <div className="studio-edit-text" style={{
                                fontSize: el.fontSize, color: el.color, fontFamily: toCssFontFamily(el.fontFamily),
                                fontWeight: el.fontWeight, fontStyle: el.fontStyle, textAlign: el.textAlign,
                                lineHeight: el.lineHeight, letterSpacing: el.letterSpacing,
                                whiteSpace: 'nowrap', position: 'relative', display: 'grid'
                            }}>
                                {textEditor?.id === el.id ? (
                                    <>
                                        {/* Mirror span for auto-growth */}
                                        <span style={{
                                            gridArea: '1/1', visibility: 'hidden', whiteSpace: 'nowrap',
                                            padding: 0, border: 'none', font: 'inherit', letterSpacing: 'inherit',
                                            minWidth: '50px' // Ensure some clickable area
                                        }}>
                                            {textEditor.value || ' '}
                                        </span>
                                        <textarea
                                            autoFocus
                                            className="studio-edit-textarea"
                                            value={textEditor.value}
                                            onChange={(e) => handleTextEditorChange(el.id, e.target.value)}
                                            style={{
                                                gridArea: '1/1', width: '100%', height: '100%',
                                                background: 'none', border: 'none', resize: 'none', outline: 'none',
                                                padding: 0, margin: 0, font: 'inherit', color: 'inherit',
                                                lineHeight: 'inherit', letterSpacing: 'inherit',
                                                whiteSpace: 'nowrap', overflow: 'hidden'
                                            }}
                                        />
                                    </>
                                ) : el.text}
                            </div>
                        )}
                        {el.type === 'watermark' && (
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    position: 'relative',
                                    overflow: 'visible',
                                }}
                            >
                                {Array.from({
                                    length: (() => {
                                        if (!el.repeatEnabled) return 1;
                                        const charCount = Math.max(4, (el.text || '').trim().length || 0);
                                        const baseWidthRatio = Math.max(0.08, (el.fontSize * charCount * 0.64) / width);
                                        const baseHeightRatio = Math.max(0.02, (el.fontSize * 1.35) / height);
                                        const angleRad = Math.abs((el.rotation || 0) * Math.PI / 180);
                                        const cos = Math.abs(Math.cos(angleRad));
                                        const sin = Math.abs(Math.sin(angleRad));
                                        const textWidthRatio = clamp(baseWidthRatio * cos + baseHeightRatio * sin, 0.14, 1.2);
                                        const textHeightRatio = clamp(baseWidthRatio * sin + baseHeightRatio * cos, 0.03, 0.35);
                                        const stepX = Math.max(textWidthRatio * 1.22, textWidthRatio + 0.06);
                                        const stepY = Math.max(textHeightRatio * 1.3, textHeightRatio + 0.05);
                                        const cols = Math.max(1, Math.ceil((1 + textWidthRatio * 3) / stepX));
                                        const rows = Math.max(1, Math.ceil((1 + textHeightRatio * 3) / stepY));
                                        return Math.min(700, cols * rows);
                                    })(),
                                }).map((_, index) => {
                                    const charCount = Math.max(4, (el.text || '').trim().length || 0);
                                    const baseWidthRatio = Math.max(0.08, (el.fontSize * charCount * 0.64) / width);
                                    const baseHeightRatio = Math.max(0.02, (el.fontSize * 1.35) / height);
                                    const angleRad = Math.abs((el.rotation || 0) * Math.PI / 180);
                                    const cos = Math.abs(Math.cos(angleRad));
                                    const sin = Math.abs(Math.sin(angleRad));
                                    const textWidthRatio = clamp(baseWidthRatio * cos + baseHeightRatio * sin, 0.14, 1.2);
                                    const textHeightRatio = clamp(baseWidthRatio * sin + baseHeightRatio * cos, 0.03, 0.35);
                                    const stepX = Math.max(textWidthRatio * 1.22, textWidthRatio + 0.06);
                                    const stepY = Math.max(textHeightRatio * 1.3, textHeightRatio + 0.05);
                                    const startX = -textWidthRatio + clamp(el.x, 0, 1);
                                    const startY = -textHeightRatio + clamp(el.y, 0, 1);
                                    const cols = Math.max(1, Math.ceil((1 + textWidthRatio * 3) / stepX));
                                    const col = el.repeatEnabled ? index % cols : 0;
                                    const row = el.repeatEnabled ? Math.floor(index / cols) : 0;
                                    const staggerX = el.repeatEnabled && row % 2 === 1 ? stepX * 0.5 : 0;
                                    const tx = el.repeatEnabled ? startX + staggerX + col * stepX : 0;
                                    const ty = el.repeatEnabled ? startY + row * stepY : 0;
                                    const centerX = (tx + textWidthRatio * 0.5) * 100;
                                    const centerY = (ty + textHeightRatio * 0.5) * 100;
                                    return (
                                        <div
                                            key={`${el.id}-wm-${index}`}
                                            style={{
                                                position: 'absolute',
                                                left: `${centerX}%`,
                                                top: `${centerY}%`,
                                                color: el.color,
                                                opacity: el.opacity,
                                                fontSize: el.fontSize,
                                                fontFamily: toCssFontFamily(el.fontFamily),
                                                fontWeight: el.fontWeight,
                                                fontStyle: el.fontStyle,
                                                lineHeight: 1.1,
                                                whiteSpace: 'nowrap',
                                                pointerEvents: 'none',
                                                userSelect: 'none',
                                                textTransform: 'uppercase',
                                                transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
                                                transformOrigin: 'center center',
                                            }}
                                        >
                                            {el.text}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {el.type === 'rect' && (
                            <div style={{
                                width: '100%', height: '100%', backgroundColor: el.fill,
                                border: `${el.strokeWidth}px solid ${el.stroke}`, opacity: el.opacity
                            }} />
                        )}
                        {el.type === 'form-field' && (
                            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'visible' }}>
                                <div style={{
                                    position: 'absolute',
                                    top: -30,
                                    left: 0,
                                    background: '#4b5563',
                                    color: '#e5e7eb',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    padding: '4px 10px',
                                    lineHeight: 1.2,
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {el.name || el.id}
                                </div>
                                <div style={{
                                    width: '100%', height: '100%',
                                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                    border: '2px solid rgba(148, 163, 184, 0.9)', opacity: el.opacity,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: 'sans-serif', fontSize: 12, color: '#475569',
                                    overflow: 'hidden',
                                    textShadow: '0 1px 0 rgba(255,255,255,0.6)',
                                }}>
                                    {el.formType === 'text'
                                        ? 'Text'
                                        : el.formType === 'multiline'
                                            ? 'Multiline'
                                            : el.formType === 'checkbox'
                                                ? 'Checkbox'
                                                : el.formType === 'radio'
                                                    ? 'Radio'
                                                    : 'Dropdown'}
                                </div>
                            </div>
                        )}
                        {el.type === 'image' && (
                            <img
                                src={el.dataUrl}
                                alt="Signature"
                                draggable={false}
                                style={{ width: '100%', height: '100%', objectFit: 'fill', opacity: el.opacity, pointerEvents: 'none', userSelect: 'none' }}
                            />
                        )}
                        {el.type === 'stroke' && strokeBounds && (
                            <svg
                                width="100%"
                                height="100%"
                                viewBox={`0 0 ${strokeWidth * width} ${strokeHeight * height}`}
                                style={{ overflow: 'visible', pointerEvents: 'none' }}
                            >
                                {strokePaths.map((path, pathIndex) => (
                                    <polyline
                                        key={`${el.id}-path-${pathIndex}`}
                                        points={path.reduce((acc, value, idx) => {
                                            if (idx % 2 === 0) {
                                                const px = ((value - strokeBounds.minX + paddingLimit) / strokeWidth) * (strokeWidth * width);
                                                return `${acc}${px},`;
                                            }
                                            const py = ((value - strokeBounds.minY + paddingLimit) / strokeHeight) * (strokeHeight * height);
                                            return `${acc}${py} `;
                                        }, '').trim()}
                                        fill="none"
                                        stroke={el.color}
                                        strokeWidth={el.width}
                                        strokeOpacity={el.opacity}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                ))}
                            </svg>
                        )}
                        {selectedElementId === el.id && el.type === 'image' && (
                            <button
                                type="button"
                                className="studio-edit-text-resize"
                                title="Resize"
                                onPointerDown={(event) => {
                                    event.stopPropagation();
                                    const image = el as ImageElement;
                                    dragSessionRef.current = {
                                        mode: 'resize-image',
                                        id: image.id,
                                        startClientX: event.clientX,
                                        startClientY: event.clientY,
                                        originW: image.w,
                                        originH: image.h,
                                        originX: image.x,
                                        originY: image.y,
                                        initialElements: elements,
                                    };
                                    try {
                                        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
                                    } catch (err) { }
                                }}
                            />
                        )}
                        {selectedElementId === el.id && el.type === 'form-field' && (
                            <button
                                type="button"
                                className="studio-edit-text-resize"
                                title="Resize field"
                                onPointerDown={(event) => {
                                    event.stopPropagation();
                                    dragSessionRef.current = {
                                        mode: 'resize-form-field',
                                        id: el.id,
                                        startClientX: event.clientX,
                                        startClientY: event.clientY,
                                        originW: el.w,
                                        originH: el.h,
                                        originX: el.x,
                                        originY: el.y,
                                        initialElements: elements,
                                    };
                                    try {
                                        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
                                    } catch (err) { }
                                }}
                            />
                        )}
                        {selectedElementId === el.id && el.type === 'text' && textEditor?.id !== el.id && (
                            <button
                                type="button"
                                className="studio-edit-text-resize"
                                title="Resize text"
                                onPointerDown={(event) => {
                                    event.stopPropagation();
                                    const textEl = el as TextElement;
                                    dragSessionRef.current = {
                                        mode: 'resize-text',
                                        id: textEl.id,
                                        startClientX: event.clientX,
                                        startClientY: event.clientY,
                                        originW: textEl.w,
                                        originH: textEl.h,
                                        originFontSize: textEl.fontSize,
                                        initialElements: elements,
                                    };
                                    try {
                                        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
                                    } catch (err) { }
                                }}
                            />
                        )}
                        {selectedElementId === el.id && el.type === 'watermark' && (
                            <>
                                <button
                                    type="button"
                                    className="studio-edit-text-resize"
                                    title="Resize watermark"
                                    onPointerDown={(event) => {
                                        event.stopPropagation();
                                        const mark = el as WatermarkElement;
                                        dragSessionRef.current = {
                                            mode: 'resize-watermark',
                                            id: mark.id,
                                            startClientX: event.clientX,
                                            startClientY: event.clientY,
                                            originW: mark.w,
                                            originH: mark.h,
                                            originFontSize: mark.fontSize,
                                            originX: mark.x,
                                            originY: mark.y,
                                            initialElements: elements,
                                        };
                                        try {
                                            (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
                                        } catch (err) { }
                                    }}
                                />
                                <button
                                    type="button"
                                    className="studio-edit-watermark-rotate"
                                    title="Rotate watermark"
                                    onPointerDown={(event) => {
                                        event.stopPropagation();
                                        const box = (event.currentTarget.closest('[data-editor-element-id]') as HTMLElement | null)?.getBoundingClientRect();
                                        const centerClientX = box ? box.left + box.width / 2 : event.clientX;
                                        const centerClientY = box ? box.top + box.height / 2 : event.clientY;
                                        dragSessionRef.current = {
                                            mode: 'rotate-watermark',
                                            id: el.id,
                                            centerClientX,
                                            centerClientY,
                                            originRotation: el.rotation,
                                            initialElements: elements,
                                        };
                                        try {
                                            (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
                                        } catch (err) { }
                                    }}
                                />
                            </>
                        )}
                    </div>
                );
            })}

            {/* Draw Drafts */}
            {draftRect && (
                activeTool === 'annotate' && annotateMode === 'shapes' && shapePreset !== 'rectangle'
                    ? (
                        <svg
                            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
                            width={width}
                            height={height}
                            viewBox={`0 0 ${width} ${height}`}
                        >
                            {(() => {
                                const sx = draftRect.startX * width;
                                const sy = draftRect.startY * height;
                                const ex = draftRect.endX * width;
                                const ey = draftRect.endY * height;
                                const dx = ex - sx;
                                const dy = ey - sy;
                                const len = Math.hypot(dx, dy);
                                if (len < 1) return null;
                                const points: Array<[number, number]> = [[sx, sy], [ex, ey]];
                                if (shapePreset === 'arrow') {
                                    const ux = dx / len;
                                    const uy = dy / len;
                                    const px = -uy;
                                    const py = ux;
                                    const head = Math.min(36, Math.max(14, len * 0.24));
                                    const wing = head * 0.62;
                                    points.push(
                                        [ex - ux * head + px * wing, ey - uy * head + py * wing],
                                        [ex, ey],
                                        [ex - ux * head - px * wing, ey - uy * head - py * wing],
                                    );
                                }
                                return (
                                    <polyline
                                        points={points.map(([x, y]) => `${x},${y}`).join(' ')}
                                        fill="none"
                                        stroke={shapeColor}
                                        strokeWidth={shapeStrokeWidth}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeOpacity={0.9}
                                    />
                                );
                            })()}
                        </svg>
                    )
                    : (
                        <div style={{
                            position: 'absolute', left: `${draftRect.x * 100}%`, top: `${draftRect.y * 100}%`,
                            width: `${draftRect.w * 100}%`, height: `${draftRect.h * 100}%`,
                            border: `1px dashed ${activeTool === 'annotate' && annotateMode === 'shapes' ? shapeColor : '#2563eb'}`
                        }} />
                    )
            )}
            {draftStroke && (hasSignatureDraft(draftStroke) || hasAnnotatePenDraft(draftStroke)) && (
                <svg
                    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                >
                    {[...(draftStroke.paths ?? []), ...(draftStroke.points.length >= 4 ? [draftStroke.points] : [])].map((path, index) => (
                        <polyline
                            key={`draft-stroke-${index}`}
                            points={path.reduce((acc, value, idx) => {
                                const mapped = idx % 2 === 0 ? value * width : value * height;
                                return `${acc}${mapped}${idx % 2 === 0 ? ',' : ' '}`;
                            }, '').trim()}
                            fill="none"
                            stroke={activeTool === 'sign' ? signColor : annotateColor}
                            strokeWidth={activeTool === 'sign' ? signStrokeWidth : (annotateMode === 'pen' ? annotateStrokeWidth : 12)}
                            strokeOpacity={activeTool === 'sign' ? 1 : (annotateMode === 'pen' ? 1 : 0.45)}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ))}
                </svg>
            )}

            {textLayerNodes}
        </div>
    );
});
