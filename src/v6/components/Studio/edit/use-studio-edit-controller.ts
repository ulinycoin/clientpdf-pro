import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../../../../app/react/platform-context';
import type { IWorkerCommand, WorkerStudioEditElement } from '../../../../core/public/contracts';
import { defaultFilePreviewService } from '../../../preview/preview-service';
import {
    useStudioStore,
    type PageItem,
    type StudioDocument,
    type StudioEditToolId,
    type SaveCheckpointEntry,
} from '../studio-store';
import { requestTextLayerSpans, requestTextLayerSpansFallback } from '../../../pdf/text-layer-client';
import { CommandExecutor } from '../store/command-manager';
import type { StudioToolRouteState } from '../../../studio/navigation/studio-tool-context';
const USE_COMMAND_PATTERN_FOR_SAVES = true;
import {
    EditElement,
    FormFieldElement,
    ImageElement,
    ShapePreset,
    WatermarkElement,
    TextEditorState,
    InlineUiState,
    TextLayerSpan,
    EditorToolId
} from '../editor-types';
import type { FontFamilyId } from '../inline-text-utils';

const STUDIO_TOOL_CONTEXT = {
    userId: 'studio-user',
    plan: 'pro' as const,
    entitlements: [
        'pdf.merge',
        'pdf.split',
        'pdf.compress',
        'pdf.ocr',
        'pdf.rotate',
        'pdf.delete_pages',
        'pdf.edit',
        'pdf.to_image',
        'office.convert',
        'pdf.protect.encrypt',
        'pdf.protect.unlock',
    ],
};

export interface SelectedPage {
    docId: string;
    docName: string;
    page: PageItem;
    indexInDoc: number;
}

function buildSelectedPages(
    documents: StudioDocument[],
    selection: Array<{ docId: string; pageId: string }>,
): SelectedPage[] {
    const out: SelectedPage[] = [];
    for (const selected of selection) {
        const doc = documents.find((item) => item.id === selected.docId);
        if (!doc) continue;
        const indexInDoc = doc.pages.findIndex((page) => page.id === selected.pageId);
        if (indexInDoc < 0) continue;
        out.push({
            docId: doc.id,
            docName: doc.name,
            page: doc.pages[indexInDoc],
            indexInDoc,
        });
    }
    return out;
}

function buildTypedSignatureImage(value: string, fontSize: number): { dataUrl: string; width: number; height: number } | null {
    const safe = value.trim();
    if (!safe) {
        return null;
    }

    const resolvedFontSize = Math.max(12, Math.min(96, Math.round(fontSize || 30)));
    const paddingX = Math.max(20, Math.round(resolvedFontSize * 0.8));
    const paddingY = Math.max(12, Math.round(resolvedFontSize * 0.45));

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
        return null;
    }

    context.font = `italic ${resolvedFontSize}px "Times New Roman", Times, serif`;
    const metrics = context.measureText(safe);
    const textWidth = Math.max(metrics.width, resolvedFontSize * 1.6);
    const ascent = Math.max(resolvedFontSize * 0.78, metrics.actualBoundingBoxAscent || 0);
    const descent = Math.max(resolvedFontSize * 0.24, metrics.actualBoundingBoxDescent || 0);
    const width = Math.max(180, Math.ceil(textWidth + paddingX * 2));
    const height = Math.max(80, Math.ceil(ascent + descent + paddingY * 2));

    canvas.width = width;
    canvas.height = height;

    const drawContext = canvas.getContext('2d');
    if (!drawContext) {
        return null;
    }

    drawContext.clearRect(0, 0, width, height);
    drawContext.font = `italic ${resolvedFontSize}px "Times New Roman", Times, serif`;
    drawContext.fillStyle = '#0f172a';
    drawContext.textAlign = 'left';
    drawContext.textBaseline = 'alphabetic';
    drawContext.fillText(safe, paddingX, paddingY + ascent);

    return {
        dataUrl: canvas.toDataURL('image/png'),
        width,
        height,
    };
}

function buildImageSignatureElement(payload: {
    dataUrl: string;
    width: number;
    height: number;
    signatureSource?: ImageElement['signatureSource'];
    typedSignatureMeta?: ImageElement['typedSignatureMeta'];
}): ImageElement {
    const ratio = payload.width > 0 && payload.height > 0 ? payload.width / payload.height : 3;
    const initialW = 0.28;
    const initialH = initialW / Math.max(0.2, ratio);
    return {
        id: crypto.randomUUID(),
        type: 'image',
        x: 0.36,
        y: 0.72,
        w: Math.min(0.5, Math.max(0.08, initialW)),
        h: Math.min(0.35, Math.max(0.04, initialH)),
        opacity: 1,
        dataUrl: payload.dataUrl,
        signatureSource: payload.signatureSource,
        typedSignatureMeta: payload.typedSignatureMeta,
    };
}

export function useStudioEditController(ui: any) {
    const navigate = useNavigate();
    const { runtime } = usePlatform();

    // Store reads
    const documents = useStudioStore((s) => s.documents);
    const selection = useStudioStore((s) => s.selection);
    const activeDocumentId = useStudioStore((s) => s.activeDocumentId);
    const interactionMode = useStudioStore((s) => s.interactionMode);
    const studioViewScale = useStudioStore((s) => s.studioViewScale);
    const studioViewPosition = useStudioStore((s) => s.studioViewPosition);
    const updatePage = useStudioStore((s) => s.updatePage);
    const editSession = useStudioStore((s) => s.editSession);
    const clearEditSession = useStudioStore((s) => s.clearEditSession);
    const updateEditSessionTool = useStudioStore((s) => s.updateEditSessionTool);
    const syncEditSessionTarget = useStudioStore((s) => s.syncEditSessionTarget);
    const whiteoutColor = useStudioStore((s) => s.whiteoutColor);
    const setWhiteoutColor = useStudioStore((s) => s.setWhiteoutColor);

    const saveUndoStack = useStudioStore((s) => s.saveUndoStack);
    const saveRedoStack = useStudioStore((s) => s.saveRedoStack);
    const pushSaveUndo = useStudioStore((s) => s.pushSaveUndo);
    const popSaveUndo = useStudioStore((s) => s.popSaveUndo);
    const pushSaveRedo = useStudioStore((s) => s.pushSaveRedo);
    const popSaveRedo = useStudioStore((s) => s.popSaveRedo);
    const clearSaveStacks = useStudioStore((s) => s.clearSaveStacks);

    const commandUndoStack = useStudioStore((s) => s.commandUndoStack);
    const commandRedoStack = useStudioStore((s) => s.commandRedoStack);
    const pushCommandUndo = useStudioStore((s) => s.pushCommandUndo);
    const popCommandUndo = useStudioStore((s) => s.popCommandUndo);
    const pushCommandRedo = useStudioStore((s) => s.pushCommandRedo);
    const popCommandRedo = useStudioStore((s) => s.popCommandRedo);

    // Local State
    const [tool, setTool] = useState<EditorToolId | null>(editSession?.activeTool ?? null);
    const [elements, setElements] = useState<EditElement[]>([]);
    const elementsRef = useRef<EditElement[]>([]);
    const [history, setHistory] = useState<EditElement[][]>([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isApplying, setIsApplying] = useState(false);
    const [textEditor, setTextEditor] = useState<TextEditorState | null>(null);
    const [inlineUiState, setInlineUiState] = useState<InlineUiState>('idle');
    const [textLayerSpans, setTextLayerSpans] = useState<TextLayerSpan[]>([]);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [textSelectionMode, setTextSelectionMode] = useState<'line' | 'word'>('line');
    const [applyToSelection, setApplyToSelection] = useState(false);
    const [signMode, setSignMode] = useState<'type' | 'draw'>('type');
    const [signTypedValue, setSignTypedValue] = useState('');
    const [signTypedFontSize, setSignTypedFontSize] = useState(30);
    const [signDrawColor, setSignDrawColor] = useState('#111827');
    const [signDrawStrokeWidth, setSignDrawStrokeWidth] = useState(3);
    const [annotateColor, setAnnotateColor] = useState('#fff176');
    const [annotateMode, setAnnotateMode] = useState<'highlight' | 'pen' | 'shapes'>('highlight');
    const [annotateStrokeWidth, setAnnotateStrokeWidth] = useState(5);
    const [shapePreset, setShapePreset] = useState<ShapePreset>('rectangle');
    const [shapeColor, setShapeColor] = useState('#2563eb');
    const [shapeStrokeWidth, setShapeStrokeWidth] = useState(2);
    const [isFormsComposerOpen, setFormsComposerOpen] = useState(false);
    const [textStyle, setTextStyle] = useState<{
        fontFamily: FontFamilyId;
        fontSize: number;
        fontWeight: 'normal' | 'bold';
        fontStyle: 'normal' | 'italic';
        lineHeight: number;
        letterSpacing: number;
        color: string;
        backgroundColor: string;
    }>({
        fontFamily: 'sora',
        fontSize: 18,
        fontWeight: 'normal',
        fontStyle: 'normal',
        lineHeight: 1.2,
        letterSpacing: 0,
        color: '#0f172a',
        backgroundColor: '#ffffff'
    });
    const [watermarkOptions, setWatermarkOptions] = useState<{
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
    }>({
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
    });
    const [protectOptions, setProtectOptions] = useState<Record<string, unknown>>({
        permissionsOnly: true,
        userPassword: '',
        ownerPassword: '',
        keyLength: 256,
        printing: 'full',
        copying: false,
        modifying: false,
        annotating: false,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: false,
    });

    const selectedPages = useMemo(() => buildSelectedPages(documents, selection), [documents, selection]);
    const activeDocument = useMemo(() => documents.find((doc) => doc.id === activeDocumentId) ?? null, [activeDocumentId, documents]);

    const preview = useMemo(() => {
        if (editSession) {
            const sessionDoc = documents.find((doc) => doc.id === editSession.docId);
            const sessionPage = sessionDoc?.pages.find((page) => page.id === editSession.pageId);
            const sessionIndexInDoc = sessionPage ? sessionDoc?.pages.findIndex((page) => page.id === sessionPage.id) ?? -1 : -1;
            if (sessionDoc && sessionPage && sessionIndexInDoc >= 0) {
                return { docId: sessionDoc.id, docName: sessionDoc.name, page: sessionPage, indexInDoc: sessionIndexInDoc };
            }
        }
        if (selectedPages[0]) return selectedPages[0];
        if (activeDocument && activeDocument.pages[0]) {
            return { docId: activeDocument.id, docName: activeDocument.name, page: activeDocument.pages[0], indexInDoc: 0 };
        }
        return null;
    }, [activeDocument, documents, editSession, selectedPages]);

    const canApplyToSelection = selectedPages.length > 1;

    useEffect(() => {
        if (!editSession?.activeTool) return;
        if (editSession.activeTool === 'shapes') {
            setTool('annotate');
            updateEditSessionTool('annotate');
            return;
        }
        if (editSession.activeTool !== tool) setTool(editSession.activeTool);
    }, [editSession?.activeTool, tool, updateEditSessionTool]);

    useEffect(() => {
        if (!preview) return;
        syncEditSessionTarget({
            docId: preview.docId,
            pageId: preview.page.id,
            pageIndex: preview.page.pageIndex,
            workingFileId: preview.page.fileId,
        });
    }, [preview?.docId, preview?.page.fileId, preview?.page.id, preview?.page.pageIndex, syncEditSessionTarget]);

    useEffect(() => {
        if (!canApplyToSelection && applyToSelection) {
            setApplyToSelection(false);
        }
    }, [applyToSelection, canApplyToSelection]);

    const [sessionRunId] = useState(() => crypto.randomUUID());

    const selectTool = useCallback((nextTool: StudioEditToolId, method: 'ui' | 'shortcut' = 'ui') => {
        const resolvedTool: StudioEditToolId = nextTool === 'shapes' ? 'annotate' : nextTool;
        setTool(resolvedTool);
        updateEditSessionTool(resolvedTool);
        runtime.telemetry.track({ type: 'STUDIO_EDIT_TOOL_SELECTED', runId: sessionRunId, toolId: 'studio.edit', tool: resolvedTool, method });
    }, [updateEditSessionTool, runtime, sessionRunId]);

    const hasDirtyChanges = elements.length > 0 || historyIndex > 0 || Boolean(textEditor && textEditor.value !== textEditor.initialValue);

    const setElementsSafe = useCallback((next: EditElement[] | ((prev: EditElement[]) => EditElement[])) => {
        setElements((prev) => {
            const resolved = typeof next === 'function' ? next(prev) : next;
            elementsRef.current = resolved;
            return resolved;
        });
    }, []);

    useEffect(() => {
        elementsRef.current = elements;
    }, [elements]);

    useEffect(() => {
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!hasDirtyChanges) return;
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [hasDirtyChanges]);

    useEffect(() => {
        setElementsSafe([]);
        setHistory([[]]);
        setHistoryIndex(0);
        setSelectedElementId(null);
        setTextEditor(null);
        setInlineUiState('idle');
        clearSaveStacks();
    }, [preview?.page.id, preview?.page.pageIndex, clearSaveStacks, setElementsSafe]);

    useEffect(() => {
        if (!preview) return;
        const abortController = new AbortController();
        void (async () => {
            try {
                const workerSpans = await requestTextLayerSpans(runtime, preview.page.fileId, preview.page.pageIndex + 1, abortController.signal);
                if (abortController.signal.aborted) return;
                const spans = workerSpans.length > 0 ? workerSpans : await requestTextLayerSpansFallback(runtime, preview.page.fileId, preview.page.pageIndex + 1);
                if (abortController.signal.aborted) return;
                setTextLayerSpans(spans);
                if (spans.length === 0) setMessage(ui.noTextLayer);
            } catch (error) {
                if (abortController.signal.aborted) return;
                try {
                    const fallbackSpans = await requestTextLayerSpansFallback(runtime, preview.page.fileId, preview.page.pageIndex + 1);
                    if (abortController.signal.aborted) return;
                    setTextLayerSpans(fallbackSpans);
                    if (fallbackSpans.length === 0) setMessage(ui.noTextLayer);
                } catch (fallbackError) {
                    if (abortController.signal.aborted) return;
                    setMessage(ui.noTextLayer);
                }
            }
        })();
        return () => abortController.abort();
    }, [preview?.page.id, preview?.page.fileId, preview?.page.pageIndex, runtime, ui.noTextLayer]);

    const pushHistory = useCallback((next: EditElement[]) => {
        setHistory((prev) => {
            const trimmed = prev.slice(0, historyIndex + 1);
            return [...trimmed, next];
        });
        setHistoryIndex((prev) => prev + 1);
    }, [historyIndex]);

    const addElement = useCallback((element: EditElement) => {
        const next = [...elementsRef.current, element];
        setElementsSafe(next);
        pushHistory(next);
        setSelectedElementId(element.id);
        setTextEditor(null);
    }, [pushHistory, setElementsSafe]);

    const addImageSignature = useCallback((payload: { dataUrl: string; width: number; height: number }) => {
        const next = buildImageSignatureElement({
            ...payload,
            signatureSource: 'upload',
        });
        addElement(next);
        setTool('sign');
    }, [addElement]);

    const addTypedSignature = useCallback((payload: { value: string; fontSize: number }) => {
        const safe = (payload.value || ui.sign || 'Signature').trim() || 'Signature';
        const rendered = buildTypedSignatureImage(safe, payload.fontSize);
        if (!rendered) {
            return;
        }
        addElement(buildImageSignatureElement({
            ...rendered,
            signatureSource: 'typed',
            typedSignatureMeta: {
                baseFontSize: Math.max(12, Math.min(96, Math.round(payload.fontSize || 30))),
                sourceWidth: rendered.width,
                sourceHeight: rendered.height,
            },
        }));
        setTool('sign');
    }, [addElement, ui.sign]);

    const insertTypedSignature = useCallback(() => {
        addTypedSignature({
            value: signTypedValue || 'Signature',
            fontSize: signTypedFontSize,
        });
    }, [addTypedSignature, signTypedFontSize, signTypedValue]);

    const addFormField = useCallback((type: 'text' | 'multiline' | 'checkbox' | 'radio' | 'dropdown') => {
        const fieldIndex = elementsRef.current.filter(
            (item) => item.type === 'form-field' && item.formType === type,
        ).length + 1;
        const size = type === 'text'
            ? { w: 0.32, h: 0.06 }
            : type === 'multiline'
                ? { w: 0.34, h: 0.24 }
                : type === 'dropdown'
                    ? { w: 0.3, h: 0.07 }
                    : { w: 0.1, h: 0.06 };
        const next: FormFieldElement = {
            id: crypto.randomUUID(),
            type: 'form-field',
            formType: type,
            name: `${type}_field_${fieldIndex}`,
            x: type === 'text' ? 0.34 : type === 'multiline' ? 0.33 : type === 'dropdown' ? 0.34 : 0.4,
            y: 0.74,
            w: size.w,
            h: size.h,
            defaultValue: type === 'checkbox' ? 'Off' : type === 'dropdown' ? 'Option 1' : '',
            options: type === 'dropdown' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
            required: false,
            fontSize: 12,
            opacity: 1,
        };
        addElement(next);
        setTool('forms');
    }, [addElement]);

    const undo = useCallback(() => {
        if (historyIndex <= 0) return;
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setElementsSafe(history[nextIndex] ?? []);
        setSelectedElementId(null);
        setTextEditor(null);
    }, [history, historyIndex, setElementsSafe]);

    const redo = useCallback(() => {
        if (historyIndex >= history.length - 1) return;
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setElementsSafe(history[nextIndex] ?? []);
        setSelectedElementId(null);
        setTextEditor(null);
    }, [history, historyIndex, setElementsSafe]);

    const deleteSelected = useCallback(() => {
        if (!selectedElementId) return;
        const next = elements.filter((item) => item.id !== selectedElementId);
        setElementsSafe(next);
        pushHistory(next);
        setSelectedElementId(null);
        setTextEditor(null);
    }, [elements, pushHistory, selectedElementId, setElementsSafe]);



    const handleElementAction = useCallback((id: string, action: 'delete' | 'duplicate' | 'update', patch?: any) => {
        let changeType: string | undefined;
        if (action === 'delete') {
            const next = elements.filter(el => el.id !== id);
            setElementsSafe(next);
            pushHistory(next);
            setSelectedElementId(null);
        } else if (action === 'duplicate') {
            const el = elements.find(e => e.id === id);
            if (el) {
                const nextX = ('x' in el) ? el.x + 0.02 : 0;
                const nextY = ('y' in el) ? el.y + 0.02 : 0;
                const next = [...elements, { ...el, id: crypto.randomUUID(), ...(('x' in el) ? { x: nextX, y: nextY } : {}) } as EditElement];
                setElementsSafe(next);
                pushHistory(next);
            }
        } else if (action === 'update' && patch) {
            setElementsSafe((prev) => prev.map(el => el.id === id ? { ...el, ...patch } : el));
            changeType = Object.keys(patch)[0];
        }
        runtime.telemetry.track({ type: 'STUDIO_EDIT_FLOATING_MENU_ACTION', runId: sessionRunId, toolId: 'studio.edit', action, changeType });
    }, [elements, pushHistory, runtime.telemetry, sessionRunId, setElementsSafe]);

    const commitTextEditor = useCallback(() => {
        if (!textEditor) return;
        if (textEditor.value !== textEditor.initialValue) pushHistory(elements);
        setInlineUiState(selectedElementId ? 'selected' : 'idle');
        setTextEditor(null);
    }, [elements, pushHistory, selectedElementId, textEditor]);

    useEffect(() => {
        if (!selectedElementId) return;
        const selected = elementsRef.current.find((item): item is WatermarkElement => (
            item.id === selectedElementId && item.type === 'watermark'
        ));
        if (!selected) return;
        setWatermarkOptions({
            text: selected.text,
            color: selected.color,
            fontSize: selected.fontSize,
            fontFamily: selected.fontFamily,
            fontWeight: selected.fontWeight,
            fontStyle: selected.fontStyle,
            opacity: selected.opacity,
            rotation: selected.rotation,
            repeatEnabled: selected.repeatEnabled,
            repeatCols: selected.repeatCols,
            repeatRows: selected.repeatRows,
            repeatGapX: selected.repeatGapX,
            repeatGapY: selected.repeatGapY,
        });
    }, [selectedElementId, elements]);

    const applyChanges = async () => {
        if (!preview) return;
        const elementsToApply = elementsRef.current;
        const targets = applyToSelection && canApplyToSelection ? selectedPages : [preview];
        let overflowCount = 0;
        let failureCount = 0;
        setIsApplying(true);
        setInlineUiState('saving');
        setMessage(null);
        const runId = crypto.randomUUID();
        try {
            const failureDetails: string[] = [];
            const checkpointEntries: SaveCheckpointEntry[] = [];

            for (const target of targets) {
                try {
                    const prevFileId = target.page.fileId;
                    const prevThumbnailUrl = target.page.thumbnailUrl;
                    const command: IWorkerCommand = {
                        id: crypto.randomUUID(),
                        type: 'COMMAND',
                        payload: {
                            type: 'APPLY_STUDIO_TEXT_EDITS',
                            payload: { fileId: target.page.fileId, pageIndex: target.page.pageIndex, elements: elementsToApply as WorkerStudioEditElement[] },
                        },
                    };
                    const finalEvent = await runtime.workerOrchestrator.dispatch(command);
                    if (finalEvent.payload.type === 'ERROR') {
                        const error = new Error(finalEvent.payload.payload.message) as Error & { code?: string };
                        error.code = finalEvent.payload.payload.code;
                        throw error;
                    }
                    if (finalEvent.payload.type !== 'STUDIO_TEXT_EDITS_APPLIED') throw new Error('Unexpected worker response for studio text edits');
                    if (finalEvent.payload.payload.overflowDetected) overflowCount += 1;
                    if (!finalEvent.payload.payload.trueReplaceApplied && finalEvent.payload.payload.trueReplaceFallbackReason) {
                        runtime.telemetry.track({
                            type: 'STUDIO_EDIT_GUARDRAIL', runId, toolId: 'studio.edit.text', fileId: target.page.fileId, pageIndex: target.page.pageIndex,
                            code: `STUDIO_TRUE_REPLACE_FALLBACK_${finalEvent.payload.payload.trueReplaceFallbackReason}`, message: 'True replace fallback path used',
                        });
                    }
                    const previewPromise = defaultFilePreviewService.getPdfPagePreview(runtime, finalEvent.payload.payload.outputId, target.page.pageIndex + 1, { scale: 2 });
                    const previewData = await Promise.race([previewPromise, new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000))]);
                    const nextThumbnailUrl = previewData?.thumbnailUrl ?? target.page.thumbnailUrl;
                    updatePage(target.docId, target.page.id, { fileId: finalEvent.payload.payload.outputId, pageIndex: target.page.pageIndex, thumbnailUrl: nextThumbnailUrl });
                    checkpointEntries.push({ docId: target.docId, pageId: target.page.id, pageIndex: target.page.pageIndex, prevFileId, prevThumbnailUrl, nextFileId: finalEvent.payload.payload.outputId, nextThumbnailUrl });
                } catch (targetError) {
                    failureCount += 1;
                    const details = targetError instanceof Error ? targetError.message : ui.saveFailed;
                    const typed = targetError as { code?: unknown; message?: unknown };
                    const code = typeof typed.code === 'string' ? typed.code : undefined;
                    if (code?.startsWith('STUDIO_EDIT_')) {
                        runtime.telemetry.track({ type: 'STUDIO_EDIT_GUARDRAIL', runId, toolId: 'studio.edit.text', fileId: target.page.fileId, pageIndex: target.page.pageIndex, code, message: typeof typed.message === 'string' ? typed.message : details });
                    }
                    failureDetails.push(details);
                }
            }
            if (failureCount > 0 && failureCount === targets.length) throw new Error(failureDetails[0] ?? ui.saveFailed);

            setInlineUiState(failureCount > 0 ? 'error' : 'saved');
            setTextEditor(null);
            setSelectedElementId(null);
            setElementsSafe([]);
            setHistory([[]]);
            setHistoryIndex(0);
            if (checkpointEntries.length > 0) {
                if (USE_COMMAND_PATTERN_FOR_SAVES) {
                    pushCommandUndo({
                        id: crypto.randomUUID(),
                        type: 'APPLY_TEXT_EDITS',
                        timestamp: Date.now(),
                        payload: { entries: checkpointEntries }
                    });
                } else {
                    pushSaveUndo({ entries: checkpointEntries });
                }
            }

            runtime.telemetry.track({
                type: 'STUDIO_EDIT_SAVE_ACTION', runId, toolId: 'studio.edit.text', action: 'apply', scope: targets.length > 1 ? 'selection' : 'single',
                pagesTotal: targets.length, pagesSucceeded: targets.length - failureCount, pagesFailed: failureCount, overflowCount, message: failureCount > 0 ? ui.partialSaveFailed : ui.changesApplied,
            });

            if (targets.length > 1) {
                const baseMessage = `${ui.changesAppliedSelection} ${targets.length}`;
                const overflowMessage = overflowCount > 0 ? ` ${ui.overflowWarning}` : '';
                const partialMessage = failureCount > 0 ? ` ${ui.partialSaveFailed}` : '';
                setMessage(`${baseMessage}.${overflowMessage}${partialMessage}`.trim());
            } else {
                setMessage(overflowCount > 0 ? `${ui.changesApplied} ${ui.overflowWarning}` : ui.changesApplied);
            }
        } catch (error) {
            setInlineUiState('error');
            const details = error instanceof Error ? error.message : ui.saveFailed;
            const pagesFailed = failureCount > 0 ? failureCount : targets.length;
            const typed = error as { code?: unknown; message?: unknown };
            const code = typeof typed.code === 'string' ? typed.code : undefined;
            if (code?.startsWith('STUDIO_EDIT_')) runtime.telemetry.track({ type: 'STUDIO_EDIT_GUARDRAIL', runId, toolId: 'studio.edit.text', fileId: preview.page.fileId, pageIndex: preview.page.pageIndex, code, message: typeof typed.message === 'string' ? typed.message : details });
            runtime.telemetry.track({ type: 'STUDIO_EDIT_SAVE_ACTION', runId, toolId: 'studio.edit.text', action: 'apply', scope: targets.length > 1 ? 'selection' : 'single', pagesTotal: targets.length, pagesSucceeded: Math.max(0, targets.length - pagesFailed), pagesFailed, overflowCount, message: details });
            setMessage(`${ui.saveFailed}${details ? ` ${details}` : ''}`.trim());
        } finally {
            setIsApplying(false);
        }
    };

    const protectAndReturnToStudio = useCallback(async (options: Record<string, unknown>) => {
        const targetDocumentId = activeDocument?.id ?? preview?.docId ?? null;
        const targetDocument = targetDocumentId
            ? documents.find((doc) => doc.id === targetDocumentId) ?? null
            : null;
        const inputIds = Array.from(new Set((targetDocument?.pages ?? []).map((page) => page.fileId)));
        if (inputIds.length === 0) {
            setMessage(ui.saveFailed);
            return;
        }

        setIsApplying(true);
        try {
            const result = await runtime.runner.execute(
                'protect-pdf',
                {
                    inputIds,
                    options: {
                        ...options,
                        studioContext: {
                            mode: 'document',
                            documentId: targetDocumentId,
                            selectedPages: [],
                        },
                    },
                },
                STUDIO_TOOL_CONTEXT,
            );

            if (result.type === 'TOOL_ERROR') {
                setMessage(result.message || ui.saveFailed);
                return;
            }
            if (result.type === 'TOOL_ACCESS_DENIED') {
                setMessage(result.details ?? result.reason);
                return;
            }

            navigate('/studio', {
                state: {
                    source: 'studio',
                    studioToolResult: {
                        toolId: 'protect-pdf',
                        outputIds: result.outputIds,
                        studioContext: {
                            mode: 'document',
                            documentId: targetDocumentId,
                            selectedPages: [],
                        },
                    },
                    studioReturnContext: {
                        activeDocumentId,
                        selection,
                        interactionMode,
                        viewScale: studioViewScale,
                        viewPosition: studioViewPosition,
                    },
                } satisfies StudioToolRouteState,
            });
        } finally {
            setIsApplying(false);
        }
    }, [
        activeDocument?.id,
        activeDocumentId,
        documents,
        interactionMode,
        navigate,
        preview?.docId,
        runtime.runner,
        selection,
        studioViewPosition,
        studioViewScale,
        ui.saveFailed,
    ]);

    const undoLastSave = useCallback(() => {
        if (USE_COMMAND_PATTERN_FOR_SAVES) {
            const command = popCommandUndo();
            if (!command || isApplying) return;
            const runId = crypto.randomUUID();
            setIsApplying(true);
            try {
                CommandExecutor.undo(command, updatePage);
                pushCommandRedo(command);
                setMessage(ui.saveReverted);
                setInlineUiState('saved');
                runtime.telemetry.track({ type: 'STUDIO_EDIT_SAVE_ACTION', runId, toolId: 'studio.edit.text', action: 'undo', scope: command.payload.entries.length > 1 ? 'selection' : 'single', pagesTotal: command.payload.entries.length, pagesSucceeded: command.payload.entries.length, pagesFailed: 0, message: ui.saveReverted });
            } finally {
                setIsApplying(false);
            }
        } else {
            const checkpoint = popSaveUndo();
            if (!checkpoint || isApplying) return;
            const runId = crypto.randomUUID();
            setIsApplying(true);
            try {
                for (const entry of checkpoint.entries) updatePage(entry.docId, entry.pageId, { fileId: entry.prevFileId, pageIndex: entry.pageIndex, thumbnailUrl: entry.prevThumbnailUrl });
                pushSaveRedo(checkpoint);
                setMessage(ui.saveReverted);
                setInlineUiState('saved');
                runtime.telemetry.track({ type: 'STUDIO_EDIT_SAVE_ACTION', runId, toolId: 'studio.edit.text', action: 'undo', scope: checkpoint.entries.length > 1 ? 'selection' : 'single', pagesTotal: checkpoint.entries.length, pagesSucceeded: checkpoint.entries.length, pagesFailed: 0, message: ui.saveReverted });
            } finally {
                setIsApplying(false);
            }
        }
    }, [popCommandUndo, pushCommandRedo, popSaveUndo, pushSaveRedo, isApplying, runtime, ui.saveReverted, updatePage]);

    const redoLastSave = useCallback(() => {
        if (USE_COMMAND_PATTERN_FOR_SAVES) {
            const command = popCommandRedo();
            if (!command || isApplying) return;
            pushCommandUndo(command);
            const runId = crypto.randomUUID();
            setIsApplying(true);
            try {
                CommandExecutor.execute(command, updatePage);
                setMessage(command.payload.entries.length > 1 ? `${ui.changesAppliedSelection} ${command.payload.entries.length}.` : ui.changesApplied);
                setInlineUiState('saved');
                runtime.telemetry.track({ type: 'STUDIO_EDIT_SAVE_ACTION', runId, toolId: 'studio.edit.text', action: 'redo', scope: command.payload.entries.length > 1 ? 'selection' : 'single', pagesTotal: command.payload.entries.length, pagesSucceeded: command.payload.entries.length, pagesFailed: 0, message: command.payload.entries.length > 1 ? `${ui.changesAppliedSelection} ${command.payload.entries.length}.` : ui.changesApplied });
            } finally {
                setIsApplying(false);
            }
        } else {
            const checkpoint = popSaveRedo();
            if (!checkpoint) return;
            pushSaveUndo(checkpoint);
            const runId = crypto.randomUUID();
            setIsApplying(true);
            try {
                for (const entry of checkpoint.entries) updatePage(entry.docId, entry.pageId, { fileId: entry.nextFileId, pageIndex: entry.pageIndex, thumbnailUrl: entry.nextThumbnailUrl });
                setMessage(checkpoint.entries.length > 1 ? `${ui.changesAppliedSelection} ${checkpoint.entries.length}.` : ui.changesApplied);
                setInlineUiState('saved');
                runtime.telemetry.track({ type: 'STUDIO_EDIT_SAVE_ACTION', runId, toolId: 'studio.edit.text', action: 'redo', scope: checkpoint.entries.length > 1 ? 'selection' : 'single', pagesTotal: checkpoint.entries.length, pagesSucceeded: checkpoint.entries.length, pagesFailed: 0, message: checkpoint.entries.length > 1 ? `${ui.changesAppliedSelection} ${checkpoint.entries.length}.` : ui.changesApplied });
            } finally {
                setIsApplying(false);
            }
        }
    }, [popCommandRedo, pushCommandUndo, popSaveRedo, pushSaveUndo, runtime, ui.changesApplied, ui.changesAppliedSelection, updatePage]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
            if (isTyping) return;

            const key = event.key.toLowerCase();

            if ((event.key === 'Delete' || event.key === 'Backspace') && !textEditor) {
                deleteSelected();
            } else if ((event.ctrlKey || event.metaKey) && key === 'z') {
                event.preventDefault();
                event.shiftKey ? redo() : undo();
            } else if ((event.ctrlKey || event.metaKey) && key === 's') {
                event.preventDefault();
                if (!isApplying && (historyIndex > 0 || hasDirtyChanges)) {
                    void applyChanges();
                }
            } else if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
                if (key === 'v') {
                    selectTool('text');
                } else if (key === 't') {
                    selectTool('text');
                } else if (key === 'a') {
                    selectTool('annotate');
                } else if (key === 'w') {
                    selectTool('watermark');
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [deleteSelected, redo, undo, applyChanges, isApplying, historyIndex, hasDirtyChanges, textEditor, selectTool]);

    return {
        runId: sessionRunId,
        navigate,
        tool, setTool: selectTool,
        elements, setElements: setElementsSafe,
        pushHistory, undo, redo,
        history, historyIndex,
        selectedElementId, setSelectedElementId, handleElementAction,
        message, setMessage,
        isApplying,
        textEditor, setTextEditor, commitTextEditor,
        inlineUiState, setInlineUiState,
        textLayerSpans,
        isSelectMode, setIsSelectMode,
        textSelectionMode, setTextSelectionMode,
        annotateColor, setAnnotateColor,
        annotateMode, setAnnotateMode,
        annotateStrokeWidth, setAnnotateStrokeWidth,
        signMode, setSignMode,
        signTypedValue, setSignTypedValue,
        signTypedFontSize, setSignTypedFontSize,
        signDrawColor, setSignDrawColor,
        signDrawStrokeWidth, setSignDrawStrokeWidth,
        shapePreset, setShapePreset,
        shapeColor, setShapeColor,
        shapeStrokeWidth, setShapeStrokeWidth,
        watermarkOptions, setWatermarkOptions,
        applyToSelection, setApplyToSelection,
        hasDirtyChanges, canApplyToSelection,
        applyChanges, undoLastSave, redoLastSave,
        isFormsComposerOpen,
        setFormsComposerOpen,
        whiteoutColor,
        setWhiteoutColor,
        textStyle,
        setTextStyle,
        protectOptions,
        setProtectOptions,
        addTypedSignature,
        addImageSignature,
        insertTypedSignature,
        addFormField,
        protectAndReturnToStudio,
        clearEditSession,
        preview, selectedPages, activeDocument,
        saveUndoStack: USE_COMMAND_PATTERN_FOR_SAVES ? commandUndoStack : saveUndoStack,
        saveRedoStack: USE_COMMAND_PATTERN_FOR_SAVES ? commandRedoStack : saveRedoStack,
    };
}
