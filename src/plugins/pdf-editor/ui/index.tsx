import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent as ReactDragEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { usePlatform } from '../../../app/react/platform-context';
import { defaultFilePreviewService } from '../../../v6/preview/preview-service';
import { LinearIcon } from '../../../v6/components/icons/linear-icon';

interface PdfEditorConfigProps {
  inputFiles: string[];
  onStart: (options: Record<string, unknown>) => void;
  onBack: () => void;
  onPickFiles?: (files: File[]) => void | Promise<void>;
  onClearFiles?: () => void | Promise<void>;
  currentStep?: 'upload' | 'config' | 'processing' | 'result';
  progress?: number;
  outputCount?: number;
  onDownload?: () => void | Promise<void>;
}

interface TextEditDraft {
  type: 'text';
  id: string;
  pageIndex: number;
  text: string;
  xRatio: number; // Percentage 0-100
  yRatio: number; // Percentage 0-100
  widthRatio: number;
  heightRatio: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  bold: boolean;
  italic: boolean;
  opacity: number;
  rotation: number;
  textAlign: 'left' | 'center' | 'right';
  horizontalScaling: number;
  originalRect?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

interface RectEditDraft {
  type: 'rect' | 'whiteout' | 'circle';
  id: string;
  pageIndex: number;
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  color: string;
  strokeWidth: number;
  opacity: number;
}

interface LineEditDraft {
  type: 'line';
  id: string;
  pageIndex: number;
  x1Ratio: number;
  y1Ratio: number;
  x2Ratio: number;
  y2Ratio: number;
  color: string;
  strokeWidth: number;
  opacity: number;
}

type EditorElementDraft = TextEditDraft | RectEditDraft | LineEditDraft;
type ShapeTool = 'rect' | 'line' | 'whiteout' | 'circle';

interface DrawingDraft {
  tool: ShapeTool;
  pageIndex: number;
  startXRatio: number;
  startYRatio: number;
  currentXRatio: number;
  currentYRatio: number;
}

interface TextLayerSpan {
  id: string;
  text: string;
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  fontSizeRatio: number;
  fontName?: string;
}

interface PdfJsLike {
  getDocument(params: { data: Uint8Array; disableWorker: boolean; verbosity?: number }): { promise: Promise<any> };
  GlobalWorkerOptions?: { workerSrc?: string };
  VerbosityLevel?: { ERRORS?: number };
  Util?: {
    transform: (m1: number[], m2: number[]) => number[];
  };
}

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.2;
const PREVIEW_SCALE = 2.1;
const HISTORY_LIMIT = 80;

let pdfJsPromise: Promise<PdfJsLike | null> | null = null;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function cloneEditDraft(edit: EditorElementDraft): EditorElementDraft {
  if (edit.type === 'text') {
    return {
      ...edit,
      originalRect: edit.originalRect ? { ...edit.originalRect } : undefined,
    };
  }
  return { ...edit };
}

function cloneEditDraftList(edits: EditorElementDraft[]): EditorElementDraft[] {
  return edits.map((edit) => cloneEditDraft(edit));
}

function serializeEdits(edits: EditorElementDraft[]): string {
  return JSON.stringify(
    edits.map((edit) => ({
      type: edit.type,
      id: edit.id,
      pageIndex: edit.pageIndex,
      ...(edit.type === 'text'
        ? {
          text: edit.text,
          xRatio: edit.xRatio,
          yRatio: edit.yRatio,
          widthRatio: edit.widthRatio,
          heightRatio: edit.heightRatio,
          fontSize: edit.fontSize,
          fontFamily: edit.fontFamily,
          color: edit.color,
          backgroundColor: edit.backgroundColor,
          bold: edit.bold,
          italic: edit.italic,
          opacity: edit.opacity,
          rotation: edit.rotation,
          textAlign: edit.textAlign,
          horizontalScaling: edit.horizontalScaling,
          originalRect: edit.originalRect,
        }
        : edit.type === 'line'
          ? {
            x1Ratio: edit.x1Ratio,
            y1Ratio: edit.y1Ratio,
            x2Ratio: edit.x2Ratio,
            y2Ratio: edit.y2Ratio,
            color: edit.color,
            strokeWidth: edit.strokeWidth,
            opacity: edit.opacity,
          }
          : {
            xRatio: edit.xRatio,
            yRatio: edit.yRatio,
            widthRatio: edit.widthRatio,
            heightRatio: edit.heightRatio,
            color: edit.color,
            strokeWidth: edit.strokeWidth,
            opacity: edit.opacity,
          }),
    })),
  );
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return true;
  }
  return target.isContentEditable;
}

async function loadPdfJs(): Promise<PdfJsLike | null> {
  if (!pdfJsPromise) {
    pdfJsPromise = (async () => {
      try {
        const pdfjs = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as unknown as PdfJsLike;
        if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
          const workerSrcMod = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')) as { default?: string };
          if (workerSrcMod.default) {
            pdfjs.GlobalWorkerOptions.workerSrc = workerSrcMod.default;
          }
        }
        return pdfjs;
      } catch {
        return null;
      }
    })();
  }
  return pdfJsPromise;
}

async function buildTextLayerSpans(pdfBytes: Uint8Array, pageNumber: number): Promise<TextLayerSpan[]> {
  const pdfjs = await loadPdfJs();
  if (!pdfjs || !pdfjs.Util?.transform) {
    return [];
  }

  const loadingTask = pdfjs.getDocument({
    data: pdfBytes,
    disableWorker: true,
    verbosity: pdfjs.VerbosityLevel?.ERRORS ?? 0,
  });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: PREVIEW_SCALE });
  const textContent = await page.getTextContent();
  const textStyles = textContent.styles as Record<string, { ascent?: number; descent?: number }>;

  const spans: TextLayerSpan[] = [];
  for (let i = 0; i < textContent.items.length; i += 1) {
    const item = textContent.items[i] as any;
    if (!item || typeof item.str !== 'string' || item.str.trim().length === 0 || !Array.isArray(item.transform)) {
      continue;
    }

    const tx = pdfjs.Util.transform(viewport.transform, item.transform);
    const x = tx[4];
    const y = tx[5];
    const fontHeight = Math.hypot(tx[2], tx[3]) || (Number(item.height) * PREVIEW_SCALE) || 8;
    const style = textStyles[item.fontName];
    let fontAscent = fontHeight;
    if (style?.ascent) {
      fontAscent = style.ascent * fontHeight;
    } else if (style?.descent) {
      fontAscent = (1 + style.descent) * fontHeight;
    }

    // More precise width calculation. 
    // item.width is often more reliable but can be bloated if it includes trailing spaces.
    // fontHeight * chars * 0.5 is a decent estimate for proportional fonts if width is missing.
    const estimatedWidth = fontHeight * item.str.length * 0.46;
    const width = Math.max(1, (Number(item.width) * PREVIEW_SCALE || estimatedWidth));

    // Height should be exactly the font height to avoid overlapping other lines.
    const height = Math.max(1, (Number(item.height) * PREVIEW_SCALE || fontHeight * 1.1));
    const top = y - fontAscent;

    spans.push({
      id: `span-${i}-${item.str.length}`,
      text: item.str,
      xRatio: clamp(x / viewport.width, 0, 1),
      yRatio: clamp(top / viewport.height, 0, 1),
      widthRatio: clamp(width / viewport.width, 0.001, 1),
      heightRatio: clamp(height / viewport.height, 0.001, 1),
      fontSizeRatio: clamp(fontHeight / viewport.height, 0.004, 0.25),
      fontName: item.fontName,
    });
  }

  return spans;
}

export default function PdfEditorConfig({
  inputFiles,
  onStart,
  onBack,
  onPickFiles,
  onClearFiles,
  currentStep,
  progress = 0,
  outputCount = 0,
  onDownload,
}: PdfEditorConfigProps) {
  const { runtime } = usePlatform();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [fileNames, setFileNames] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [edits, setEdits] = useState<EditorElementDraft[]>([]);
  const [selectedEditId, setSelectedEditId] = useState<string | null>(null);
  const [isAddTextMode, setIsAddTextMode] = useState(false);
  const [activeShapeTool, setActiveShapeTool] = useState<ShapeTool | null>(null);
  const [drawingDraft, setDrawingDraft] = useState<DrawingDraft | null>(null);
  const [savedEditsSignature, setSavedEditsSignature] = useState<string | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [textLayerSpans, setTextLayerSpans] = useState<TextLayerSpan[]>([]);
  const [stageHeight, setStageHeight] = useState(0);
  const [isUploadDragging, setIsUploadDragging] = useState(false);
  const historyRef = useRef<EditorElementDraft[][]>([[]]);
  const historyIndexRef = useRef(0);
  const previousStepRef = useRef<typeof currentStep>(currentStep);
  const suppressNextStageClickRef = useRef(false);
  const uiRunId = useMemo(() => `pdf-editor-ui-${crypto.randomUUID()}`, []);

  const fileId = inputFiles[0] ?? null;
  const hasMultipleFiles = inputFiles.length > 1;

  const isProcessing = currentStep === 'processing';
  const hasResult = currentStep === 'result' && outputCount > 0;
  const loadingPercent = Math.max(0, Math.min(100, Math.round(progress)));

  const renderStageHeight = stageHeight > 0 ? stageHeight : 842;

  const pageEdits = useMemo(
    () => edits.filter((edit) => edit.pageIndex === currentPage - 1),
    [currentPage, edits],
  );
  const pageTextEdits = useMemo(
    () => pageEdits.filter((edit): edit is TextEditDraft => edit.type === 'text'),
    [pageEdits],
  );
  const pageShapeEdits = useMemo(
    () => pageEdits.filter((edit): edit is RectEditDraft | LineEditDraft => edit.type !== 'text'),
    [pageEdits],
  );

  const selectedEdit = useMemo(
    () => edits.find((edit) => edit.id === selectedEditId) ?? null,
    [edits, selectedEditId],
  );
  const selectedTextEdit = useMemo(
    () => (selectedEdit?.type === 'text' ? selectedEdit : null),
    [selectedEdit],
  );

  const editsSignature = useMemo(() => serializeEdits(edits), [edits]);
  const hasUnsavedChanges = edits.length > 0 && editsSignature !== (savedEditsSignature ?? '');
  const canUndo = useMemo(() => historyIndexRef.current > 0, [historyVersion]);
  const canRedo = useMemo(() => historyIndexRef.current < historyRef.current.length - 1, [historyVersion]);
  const trackEditorAction = useCallback(
    (
      action: 'apply' | 'undo' | 'redo',
      message: string,
      pagesTotal: number,
      pagesSucceeded = pagesTotal,
      pagesFailed = 0,
    ) => {
      runtime.telemetry.track({
        type: 'STUDIO_EDIT_SAVE_ACTION',
        runId: uiRunId,
        toolId: 'pdf-editor',
        action,
        scope: pagesTotal > 1 ? 'selection' : 'single',
        pagesTotal: Math.max(1, pagesTotal),
        pagesSucceeded: Math.max(0, pagesSucceeded),
        pagesFailed: Math.max(0, pagesFailed),
        message,
      });
    },
    [runtime.telemetry, uiRunId],
  );

  const pushHistorySnapshot = useCallback((elements: EditorElementDraft[]) => {
    const snapshot = cloneEditDraftList(elements);
    const current = historyRef.current[historyIndexRef.current] ?? [];
    if (serializeEdits(current) === serializeEdits(snapshot)) {
      return;
    }

    let nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    nextHistory.push(snapshot);
    if (nextHistory.length > HISTORY_LIMIT) {
      nextHistory = nextHistory.slice(nextHistory.length - HISTORY_LIMIT);
    }

    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    setHistoryVersion((version) => version + 1);
  }, []);

  const resetHistory = useCallback((elements: EditorElementDraft[]) => {
    const snapshot = cloneEditDraftList(elements);
    historyRef.current = [snapshot];
    historyIndexRef.current = 0;
    setHistoryVersion((version) => version + 1);
  }, []);

  const undoEditChange = useCallback(() => {
    if (historyIndexRef.current <= 0) {
      return;
    }
    historyIndexRef.current -= 1;
    const snapshot = historyRef.current[historyIndexRef.current] ?? [];
    const next = cloneEditDraftList(snapshot);
    setEdits(next);
    setSelectedEditId((current) => (next.some((edit) => edit.id === current) ? current : null));
    setHistoryVersion((version) => version + 1);
    trackEditorAction('undo', 'Undo edit', 1);
  }, [trackEditorAction]);

  const redoEditChange = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) {
      return;
    }
    historyIndexRef.current += 1;
    const snapshot = historyRef.current[historyIndexRef.current] ?? [];
    const next = cloneEditDraftList(snapshot);
    setEdits(next);
    setSelectedEditId((current) => (next.some((edit) => edit.id === current) ? current : null));
    setHistoryVersion((version) => version + 1);
    trackEditorAction('redo', 'Redo edit', 1);
  }, [trackEditorAction]);

  useEffect(() => {
    setEdits([]);
    setSelectedEditId(null);
    setCurrentPage(1);
    setIsAddTextMode(false);
    setActiveShapeTool(null);
    setDrawingDraft(null);
    setSavedEditsSignature(null);
    resetHistory([]);
    suppressNextStageClickRef.current = false;
  }, [fileId, resetHistory]);

  useEffect(() => {
    const previousStep = previousStepRef.current;
    if (currentStep === 'result' && previousStep !== 'result') {
      setSavedEditsSignature(editsSignature);
      if (edits.length > 0) {
        const editedPages = new Set(edits.map((edit) => edit.pageIndex));
        trackEditorAction('apply', 'PDF edits saved', editedPages.size);
      }
    }
    previousStepRef.current = currentStep;
  }, [currentStep, edits, editsSignature, trackEditorAction]);

  useEffect(() => {
    if (!selectedEditId) {
      return;
    }
    if (!pageEdits.some((edit) => edit.id === selectedEditId)) {
      setSelectedEditId(null);
    }
  }, [pageEdits, selectedEditId]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }
    const onBeforeUnload = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (inputFiles.length === 0) {
      setFileNames([]);
      return;
    }

    void Promise.all(
      inputFiles.map(async (id) => {
        const entry = await runtime.vfs.read(id);
        return entry.getName();
      }),
    ).then((names) => setFileNames(names));
  }, [inputFiles, runtime.vfs]);

  useEffect(() => {
    if (!fileId) {
      setThumbnailUrl(null);
      setPageCount(1);
      return;
    }

    const abortController = new AbortController();
    setIsLoadingPreview(true);

    void (async () => {
      try {
        const preview = await defaultFilePreviewService.getPdfPagePreview(
          runtime,
          fileId,
          currentPage,
          { scale: PREVIEW_SCALE },
          abortController.signal,
        );
        if (abortController.signal.aborted) {
          return;
        }
        setThumbnailUrl(preview.thumbnailUrl);
        setPageCount(Math.max(1, preview.pageCount ?? 1));
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingPreview(false);
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [currentPage, fileId, runtime]);

  useEffect(() => {
    if (!fileId) {
      setTextLayerSpans([]);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const entry = await runtime.vfs.read(fileId);
        const blob = await entry.getBlob();
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const spans = await buildTextLayerSpans(bytes, currentPage);
        if (!cancelled) {
          setTextLayerSpans(spans);
        }
      } catch {
        if (!cancelled) {
          setTextLayerSpans([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentPage, fileId, runtime.vfs]);

  const appendEditFromBounds = useCallback((params: {
    text: string;
    xRatio: number;
    yRatio: number;
    widthRatio?: number;
    heightRatio?: number;
    fontSize: number;
    fontFamily?: string;
    bold?: boolean;
    italic?: boolean;
    textAlign?: 'left' | 'center' | 'right';
    originalRect?: TextEditDraft['originalRect'];
  }) => {
    const text = params.text.trim();
    if (!fileId || text.length === 0) {
      return;
    }

    const normalizedHeight = clamp(params.heightRatio ?? 10, 1.6, 100);
    const derivedFontSize = normalizedHeight * 8.42 * 0.86;

    const nextEdit: TextEditDraft = {
      type: 'text',
      id: crypto.randomUUID(),
      pageIndex: currentPage - 1,
      text,
      xRatio: clamp(params.xRatio, 0, 100),
      yRatio: clamp(params.yRatio, 0, 100),
      widthRatio: clamp(params.widthRatio ?? 30, 0.5, 100),
      heightRatio: normalizedHeight,
      fontSize: clamp(Math.max(params.fontSize, derivedFontSize), 8, 144),
      fontFamily: params.fontFamily || 'Roboto',
      color: '#000000',
      backgroundColor: '#ffffff',
      bold: params.bold || false,
      italic: params.italic || false,
      opacity: 100,
      rotation: 0,
      textAlign: params.textAlign || 'left',
      horizontalScaling: 1.0,
      originalRect: params.originalRect,
    };

    setEdits((current) => {
      const next = [...current, nextEdit];
      pushHistorySnapshot(next);
      return next;
    });
    setSelectedEditId(nextEdit.id);
  }, [currentPage, fileId, pushHistorySnapshot]);

  const pickInputFiles = useCallback(async (files: File[]): Promise<void> => {
    if (files.length === 0 || !onPickFiles) {
      setIsUploadDragging(false);
      return;
    }
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Replace selected files and lose unsaved edits?');
      if (!confirmed) {
        setIsUploadDragging(false);
        return;
      }
    }
    setIsUploadDragging(false);
    await onPickFiles(files);
  }, [hasUnsavedChanges, onPickFiles]);

  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    event.target.value = '';
    await pickInputFiles(files);
  };

  const handleUploadDragOver = useCallback((event: ReactDragEvent<HTMLDivElement>) => {
    if (!onPickFiles) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setIsUploadDragging(true);
  }, [onPickFiles]);

  const handleUploadDragLeave = useCallback((event: ReactDragEvent<HTMLDivElement>) => {
    if (!onPickFiles) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const nextTarget = event.relatedTarget;
    if (nextTarget && event.currentTarget.contains(nextTarget as Node)) {
      return;
    }
    setIsUploadDragging(false);
  }, [onPickFiles]);

  const handleUploadDrop = useCallback((event: ReactDragEvent<HTMLDivElement>) => {
    if (!onPickFiles) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];
    void pickInputFiles(files);
  }, [onPickFiles, pickInputFiles]);

  const updateSelectedEdit = useCallback((updates: Partial<TextEditDraft>) => {
    if (!selectedEditId) {
      return;
    }

    setEdits((current) => {
      const next = current.map((item) => {
        if (item.id !== selectedEditId || item.type !== 'text') {
          return item;
        }

        const merged = { ...item, ...updates };
        return {
          ...merged,
          xRatio: clamp(merged.xRatio, 0, 100),
          yRatio: clamp(merged.yRatio, 0, 100),
          fontSize: clamp(merged.fontSize, 4, 144),
        };
      });
      pushHistorySnapshot(next);
      return next;
    });
  }, [pushHistorySnapshot, selectedEditId]);

  const removeSelectedEdit = useCallback(() => {
    if (!selectedEditId) {
      return;
    }

    setEdits((current) => {
      const next = current.filter((item) => item.id !== selectedEditId);
      pushHistorySnapshot(next);
      return next;
    });
    setSelectedEditId(null);
  }, [pushHistorySnapshot, selectedEditId]);

  const createEditFromSpan = useCallback((span: TextLayerSpan) => {
    const lineThreshold = Math.max(0.0025, span.heightRatio * 0.55);
    const lineSpans = textLayerSpans
      .filter((candidate) => (
        Math.abs(candidate.yRatio - span.yRatio) <= lineThreshold ||
        Math.abs((candidate.yRatio + candidate.heightRatio) - (span.yRatio + span.heightRatio)) <= lineThreshold
      ))
      .sort((a, b) => a.xRatio - b.xRatio);

    if (lineSpans.length === 0) {
      return;
    }

    const left = Math.min(...lineSpans.map((s) => s.xRatio));
    const top = Math.min(...lineSpans.map((s) => s.yRatio));
    const right = Math.max(...lineSpans.map((s) => s.xRatio + s.widthRatio));
    const bottom = Math.max(...lineSpans.map((s) => s.yRatio + s.heightRatio));
    const width = right - left;
    const height = bottom - top;

    const ordered = [...lineSpans].sort((a, b) => a.xRatio - b.xRatio);
    let mergedText = '';
    for (let i = 0; i < ordered.length; i += 1) {
      const current = ordered[i];
      if (i > 0) {
        const prev = ordered[i - 1];
        const gap = current.xRatio - (prev.xRatio + prev.widthRatio);
        if (gap > Math.max(0.0015, current.heightRatio * 0.2) && !mergedText.endsWith(' ') && !current.text.startsWith(' ')) {
          mergedText += ' ';
        }
      }
      mergedText += current.text;
    }
    mergedText = mergedText.replace(/\s+/g, ' ').trim();
    if (!mergedText) {
      return;
    }

    const rect = {
      x: left * 100,
      y: top * 100,
      w: width * 100,
      h: Math.max(height * 100, 1.6),
    };

    const existing = edits.find((edit) => (
      edit.type === 'text' &&
      edit.pageIndex === currentPage - 1 &&
      edit.originalRect &&
      Math.abs(edit.originalRect.x - rect.x) < 0.6 &&
      Math.abs(edit.originalRect.y - rect.y) < 0.6 &&
      Math.abs(edit.originalRect.w - rect.w) < 0.8 &&
      Math.abs(edit.originalRect.h - rect.h) < 0.8
    ));
    if (existing) {
      setSelectedEditId(existing.id);
      return;
    }

    appendEditFromBounds({
      text: mergedText,
      xRatio: rect.x,
      yRatio: rect.y,
      widthRatio: rect.w,
      heightRatio: rect.h,
      fontSize: (rect.h / 100) * 842 * 0.9,
      fontFamily: 'Roboto',
      originalRect: rect,
    });
  }, [appendEditFromBounds, currentPage, edits, textLayerSpans]);

  const toStageRatiosFromEvent = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) {
      return null;
    }
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return null;
    }
    const xRatio = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    const yRatio = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
    return { xRatio, yRatio };
  }, []);

  const commitShapeFromDrawing = useCallback((draft: DrawingDraft) => {
    const minX = Math.min(draft.startXRatio, draft.currentXRatio);
    const minY = Math.min(draft.startYRatio, draft.currentYRatio);
    const maxX = Math.max(draft.startXRatio, draft.currentXRatio);
    const maxY = Math.max(draft.startYRatio, draft.currentYRatio);
    const width = maxX - minX;
    const height = maxY - minY;

    let nextShape: RectEditDraft | LineEditDraft | null = null;
    if (draft.tool === 'line') {
      const length = Math.hypot(draft.currentXRatio - draft.startXRatio, draft.currentYRatio - draft.startYRatio);
      if (length < 0.6) {
        return;
      }
      nextShape = {
        type: 'line',
        id: crypto.randomUUID(),
        pageIndex: draft.pageIndex,
        x1Ratio: draft.startXRatio,
        y1Ratio: draft.startYRatio,
        x2Ratio: draft.currentXRatio,
        y2Ratio: draft.currentYRatio,
        color: '#dc2626',
        strokeWidth: 2,
        opacity: 100,
      };
    } else {
      if (width < 0.6 || height < 0.6) {
        return;
      }
      nextShape = {
        type: draft.tool,
        id: crypto.randomUUID(),
        pageIndex: draft.pageIndex,
        xRatio: minX,
        yRatio: minY,
        widthRatio: width,
        heightRatio: height,
        color: draft.tool === 'whiteout' ? '#ffffff' : '#0f172a',
        strokeWidth: draft.tool === 'whiteout' ? 0 : 2,
        opacity: 100,
      };
    }

    if (!nextShape) {
      return;
    }

    setEdits((current) => {
      const next = [...current, nextShape as EditorElementDraft];
      pushHistorySnapshot(next);
      return next;
    });
    setSelectedEditId(null);
    trackEditorAction('apply', `Add ${nextShape.type}`, 1);
  }, [pushHistorySnapshot, trackEditorAction]);

  const handleStageMouseDown = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (!fileId || isAddTextMode || !activeShapeTool || event.button !== 0) {
      return;
    }
    const ratios = toStageRatiosFromEvent(event);
    if (!ratios) {
      return;
    }
    setDrawingDraft({
      tool: activeShapeTool,
      pageIndex: currentPage - 1,
      startXRatio: ratios.xRatio,
      startYRatio: ratios.yRatio,
      currentXRatio: ratios.xRatio,
      currentYRatio: ratios.yRatio,
    });
    setSelectedEditId(null);
    event.preventDefault();
    event.stopPropagation();
  }, [activeShapeTool, currentPage, fileId, isAddTextMode, toStageRatiosFromEvent]);

  const handleStageMouseMove = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (!drawingDraft) {
      return;
    }
    const ratios = toStageRatiosFromEvent(event);
    if (!ratios) {
      return;
    }
    setDrawingDraft((current) => (current ? { ...current, currentXRatio: ratios.xRatio, currentYRatio: ratios.yRatio } : null));
    event.preventDefault();
  }, [drawingDraft, toStageRatiosFromEvent]);

  const handleStageMouseUp = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (!drawingDraft) {
      return;
    }
    const ratios = toStageRatiosFromEvent(event);
    const finalized = ratios
      ? { ...drawingDraft, currentXRatio: ratios.xRatio, currentYRatio: ratios.yRatio }
      : drawingDraft;
    setDrawingDraft(null);
    commitShapeFromDrawing(finalized);
    suppressNextStageClickRef.current = true;
    event.preventDefault();
    event.stopPropagation();
  }, [commitShapeFromDrawing, drawingDraft, toStageRatiosFromEvent]);

  useEffect(() => {
    if (!thumbnailUrl) return;
    const host = previewRef.current;
    if (!host) return;
    const stage = host.querySelector('.pdf-editor-preview-stage');
    if (stage) {
      setStageHeight(stage.clientHeight);
    }
  }, [thumbnailUrl]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === 'undefined') {
      return;
    }

    const update = () => {
      if (stage.clientHeight > 0) {
        setStageHeight(stage.clientHeight);
      }
    };
    update();

    const observer = new ResizeObserver(() => update());
    observer.observe(stage);
    return () => observer.disconnect();
  }, [previewZoom, thumbnailUrl, currentPage, fileId]);

  useEffect(() => {
    const onWindowKeyDown = (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();
      const hasModifier = event.metaKey || event.ctrlKey;
      const editable = isEditableElement(event.target);

      if (hasModifier && key === 'z' && !editable) {
        event.preventDefault();
        if (event.shiftKey) {
          redoEditChange();
          return;
        }
        undoEditChange();
        return;
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEditId && !editable) {
        event.preventDefault();
        removeSelectedEdit();
      }
    };

    window.addEventListener('keydown', onWindowKeyDown);
    return () => {
      window.removeEventListener('keydown', onWindowKeyDown);
    };
  }, [redoEditChange, removeSelectedEdit, selectedEditId, undoEditChange]);

  const startProcessing = useCallback(() => {
    const payload = edits.map((edit) => {
      if (edit.type === 'text') {
        return {
          type: 'text' as const,
          pageIndex: edit.pageIndex,
          text: edit.text,
          xRatio: edit.xRatio,
          yRatio: edit.yRatio,
          widthRatio: edit.widthRatio,
          heightRatio: edit.heightRatio,
          fontSize: edit.fontSize,
          fontFamily: edit.fontFamily,
          color: edit.color,
          backgroundColor: edit.backgroundColor,
          bold: edit.bold,
          italic: edit.italic,
          opacity: edit.opacity,
          rotation: edit.rotation,
          textAlign: edit.textAlign,
          horizontalScaling: edit.horizontalScaling,
          originalRect: edit.originalRect,
        };
      }
      if (edit.type === 'line') {
        return {
          type: 'line' as const,
          pageIndex: edit.pageIndex,
          x1Ratio: edit.x1Ratio,
          y1Ratio: edit.y1Ratio,
          x2Ratio: edit.x2Ratio,
          y2Ratio: edit.y2Ratio,
          color: edit.color,
          strokeWidth: edit.strokeWidth,
          opacity: edit.opacity,
        };
      }
      return {
        type: edit.type,
        pageIndex: edit.pageIndex,
        xRatio: edit.xRatio,
        yRatio: edit.yRatio,
        widthRatio: edit.widthRatio,
        heightRatio: edit.heightRatio,
        color: edit.color,
        strokeWidth: edit.strokeWidth,
        opacity: edit.opacity,
      };
    });

    onStart({ elements: payload, edits: payload.filter((item) => item.type === 'text') });
  }, [edits, onStart]);

  const hasDownloadReady = hasResult && !hasUnsavedChanges;
  const canSubmitEdits = Boolean(fileId) && edits.length > 0 && !isProcessing;
  const primaryActionLabel = hasDownloadReady
    ? 'Download File'
    : isProcessing
      ? `Saving ${loadingPercent}%`
      : 'Save PDF';
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Leave editor without saving?');
      if (!confirmed) {
        return;
      }
    }
    onBack();
  }, [hasUnsavedChanges, onBack]);
  const handleClearFiles = useCallback(() => {
    if (!onClearFiles) {
      return;
    }
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Clear files and lose unsaved edits?');
      if (!confirmed) {
        return;
      }
    }
    void onClearFiles();
  }, [hasUnsavedChanges, onClearFiles]);

  return (
    <div className="tool-config-root pdf-editor-concept-root">
      <div className="ocr-concept-workspace">
        <section className="tool-config-card ocr-concept-left pdf-editor-left">
          <h3 className="pdf-editor-title">Edit PDF Text</h3>
          <p className="tool-config-copy">
            Edit text, add shapes, use whiteout, then save.
          </p>

          <div
            className={`ocr-concept-upload ${isUploadDragging ? 'dragging' : ''} ${onPickFiles ? '' : 'upload-readonly'}`}
            role={onPickFiles ? 'button' : undefined}
            tabIndex={onPickFiles ? 0 : -1}
            onDragOver={handleUploadDragOver}
            onDragEnter={handleUploadDragOver}
            onDragLeave={handleUploadDragLeave}
            onDrop={handleUploadDrop}
            onClick={() => {
              if (onPickFiles) {
                inputRef.current?.click();
              }
            }}
            onKeyDown={(event) => {
              if (!onPickFiles) {
                return;
              }
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                inputRef.current?.click();
              }
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              multiple
              style={{ display: 'none' }}
              onChange={(event) => {
                void handleFileInput(event);
              }}
            />
            <span className="ocr-concept-upload-icon" aria-hidden="true">
              <LinearIcon name="upload" className="linear-icon icon-md" />
            </span>
            <p className="ocr-concept-upload-title">Drop files or click to upload</p>
            <p className="ocr-concept-upload-copy">PDF only. Editing runs locally in browser.</p>

            <div className="ocr-concept-file-chip">
              <span className="ocr-concept-file-name">{fileNames.length > 0 ? fileNames.join(', ') : 'No file selected'}</span>
              {fileNames.length > 0 && onClearFiles ? (
                <button
                  type="button"
                  className="ocr-concept-clear-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleClearFiles();
                  }}
                  aria-label="Clear selected files"
                >
                  <LinearIcon name="x" className="linear-icon" />
                </button>
              ) : (
                <LinearIcon name="refresh" className="linear-icon" />
              )}
            </div>
          </div>

          {hasMultipleFiles && (
            <p className="pdf-editor-warning">
              Multiple files selected: the same edits are applied to each file.
            </p>
          )}

          {hasUnsavedChanges && (
            <p className="pdf-editor-warning">
              You have unsaved changes.
            </p>
          )}

          {activeShapeTool && (
            <p className="pdf-editor-warning">
              Drawing tool active: {activeShapeTool}. Drag on page to draw.
            </p>
          )}

          {selectedTextEdit && (
            <>
              <label className="pdf-editor-field">
                <span>Selected text</span>
                <textarea
                  className="ocr-concept-select pdf-editor-textarea"
                  value={selectedTextEdit.text}
                  onChange={(event) => updateSelectedEdit({ text: event.target.value })}
                />
              </label>

              <label className="pdf-editor-field">
                <span>Font size: {Math.round(selectedTextEdit.fontSize)} px</span>
                <input
                  className="pdf-editor-range"
                  type="range"
                  min={8}
                  max={96}
                  value={selectedTextEdit.fontSize}
                  onChange={(event) => updateSelectedEdit({ fontSize: Number(event.target.value) })}
                />
              </label>

              <div className="pdf-editor-color-row">
                <label className="pdf-editor-field">
                  <span>Text</span>
                  <input
                    type="color"
                    value={selectedTextEdit.color}
                    onChange={(event) => updateSelectedEdit({ color: event.target.value })}
                  />
                </label>
                <label className="pdf-editor-field">
                  <span>Background</span>
                  <input
                    type="color"
                    value={selectedTextEdit.backgroundColor}
                    onChange={(event) => updateSelectedEdit({ backgroundColor: event.target.value })}
                  />
                </label>
              </div>

              <div className="pdf-editor-toolbar-right">
                <button
                  type="button"
                  className={`ocr-concept-tool-btn ${selectedTextEdit.bold ? 'pdf-editor-btn-active' : ''}`}
                  onClick={() => updateSelectedEdit({ bold: !selectedTextEdit.bold })}
                >
                  Bold
                </button>
                <button
                  type="button"
                  className={`ocr-concept-tool-btn ${selectedTextEdit.italic ? 'pdf-editor-btn-active' : ''}`}
                  onClick={() => updateSelectedEdit({ italic: !selectedTextEdit.italic })}
                >
                  Italic
                </button>
                <button
                  type="button"
                  className={`ocr-concept-tool-btn ${selectedTextEdit.textAlign === 'left' ? 'pdf-editor-btn-active' : ''}`}
                  onClick={() => updateSelectedEdit({ textAlign: 'left' })}
                >
                  Left
                </button>
                <button
                  type="button"
                  className={`ocr-concept-tool-btn ${selectedTextEdit.textAlign === 'center' ? 'pdf-editor-btn-active' : ''}`}
                  onClick={() => updateSelectedEdit({ textAlign: 'center' })}
                >
                  Center
                </button>
                <button
                  type="button"
                  className={`ocr-concept-tool-btn ${selectedTextEdit.textAlign === 'right' ? 'pdf-editor-btn-active' : ''}`}
                  onClick={() => updateSelectedEdit({ textAlign: 'right' })}
                >
                  Right
                </button>
                <button
                  type="button"
                  className="ocr-concept-tool-btn"
                  onClick={removeSelectedEdit}
                >
                  Delete
                </button>
              </div>
            </>
          )}

          <div className="tool-config-actions ocr-concept-actions">
            <button className="btn-ghost" onClick={handleBack}>Cancel</button>
            <button
              className="btn-primary"
              onClick={() => {
                if (hasDownloadReady && onDownload) {
                  void onDownload();
                  return;
                }
                startProcessing();
              }}
              disabled={hasDownloadReady ? false : !canSubmitEdits}
            >
              {primaryActionLabel}
            </button>
          </div>
        </section>

        <section className="tool-config-card ocr-concept-right pdf-editor-right">
          {!fileId ? (
            <div className="ocr-concept-empty">
              <LinearIcon name="tool" className="linear-icon icon-md" />
              <h4 className="ocr-concept-empty-title">PDF Editor</h4>
              <p className="ocr-concept-empty-copy">Upload a PDF to start inline text editing.</p>
            </div>
          ) : (
            <>
              <div className="ocr-concept-toolbar pdf-editor-toolbar">
                <div className="pdf-editor-pager">
                  <button
                    type="button"
                    className="ocr-concept-tool-btn"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage <= 1}
                  >
                    Prev
                  </button>
                  <span className="pdf-editor-page-copy">Page {currentPage}/{pageCount}</span>
                  <button
                    type="button"
                    className="ocr-concept-tool-btn"
                    onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                    disabled={currentPage >= pageCount}
                  >
                    Next
                  </button>
                </div>

                <div className="pdf-editor-toolbar-right">
                  <button
                    type="button"
                    className={`ocr-concept-tool-btn ${isAddTextMode ? 'pdf-editor-btn-active' : ''}`}
                    onClick={() => {
                      setIsAddTextMode((current) => !current);
                      setActiveShapeTool(null);
                      setDrawingDraft(null);
                      setSelectedEditId(null);
                    }}
                    aria-label="Add text block"
                  >
                    Add Text
                  </button>
                  <button
                    type="button"
                    className={`ocr-concept-tool-btn ${activeShapeTool === 'rect' ? 'pdf-editor-btn-active' : ''}`}
                    onClick={() => {
                      setActiveShapeTool((current) => (current === 'rect' ? null : 'rect'));
                      setIsAddTextMode(false);
                      setDrawingDraft(null);
                      setSelectedEditId(null);
                    }}
                    aria-label="Draw rectangle"
                  >
                    Rectangle
                  </button>
                  <button
                    type="button"
                    className={`ocr-concept-tool-btn ${activeShapeTool === 'circle' ? 'pdf-editor-btn-active' : ''}`}
                    onClick={() => {
                      setActiveShapeTool((current) => (current === 'circle' ? null : 'circle'));
                      setIsAddTextMode(false);
                      setDrawingDraft(null);
                      setSelectedEditId(null);
                    }}
                    aria-label="Draw circle"
                  >
                    Circle
                  </button>
                  <button
                    type="button"
                    className={`ocr-concept-tool-btn ${activeShapeTool === 'line' ? 'pdf-editor-btn-active' : ''}`}
                    onClick={() => {
                      setActiveShapeTool((current) => (current === 'line' ? null : 'line'));
                      setIsAddTextMode(false);
                      setDrawingDraft(null);
                      setSelectedEditId(null);
                    }}
                    aria-label="Draw line"
                  >
                    Line
                  </button>
                  <button
                    type="button"
                    className={`ocr-concept-tool-btn ${activeShapeTool === 'whiteout' ? 'pdf-editor-btn-active' : ''}`}
                    onClick={() => {
                      setActiveShapeTool((current) => (current === 'whiteout' ? null : 'whiteout'));
                      setIsAddTextMode(false);
                      setDrawingDraft(null);
                      setSelectedEditId(null);
                    }}
                    aria-label="Draw whiteout"
                  >
                    Whiteout
                  </button>
                  <button
                    type="button"
                    className="ocr-concept-tool-btn"
                    onClick={undoEditChange}
                    disabled={!canUndo}
                    aria-label="Undo"
                  >
                    Undo
                  </button>
                  <button
                    type="button"
                    className="ocr-concept-tool-btn"
                    onClick={redoEditChange}
                    disabled={!canRedo}
                    aria-label="Redo"
                  >
                    Redo
                  </button>
                  <button
                    type="button"
                    className="ocr-concept-tool-btn"
                    onClick={() => setPreviewZoom((z) => clamp(Number((z - ZOOM_STEP).toFixed(2)), ZOOM_MIN, ZOOM_MAX))}
                    disabled={previewZoom <= ZOOM_MIN}
                    aria-label="Zoom out"
                  >
                    -
                  </button>
                  <span className="pdf-editor-zoom-copy">{Math.round(previewZoom * 100)}%</span>
                  <button
                    type="button"
                    className="ocr-concept-tool-btn"
                    onClick={() => setPreviewZoom((z) => clamp(Number((z + ZOOM_STEP).toFixed(2)), ZOOM_MIN, ZOOM_MAX))}
                    disabled={previewZoom >= ZOOM_MAX}
                    aria-label="Zoom in"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="ocr-concept-tool-btn"
                    onClick={() => setPreviewZoom(1)}
                    disabled={previewZoom === 1}
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="ocr-concept-editor">
                <div className="pdf-editor-preview-scroll" ref={previewRef}>
                  <div
                    className={`pdf-editor-preview-stage ${isAddTextMode || activeShapeTool ? 'pdf-editor-preview-add' : ''}`}
                    ref={stageRef}
                    style={{ width: `${previewZoom * 100}%` }}
                    onClick={(event) => {
                      if (suppressNextStageClickRef.current) {
                        suppressNextStageClickRef.current = false;
                        return;
                      }
                      if (activeShapeTool) {
                        return;
                      }
                      if (!isAddTextMode) {
                        setSelectedEditId(null);
                        return;
                      }

                      const ratios = toStageRatiosFromEvent(event);
                      if (!ratios) {
                        return;
                      }

                      appendEditFromBounds({
                        text: 'New text',
                        xRatio: ratios.xRatio,
                        yRatio: ratios.yRatio,
                        widthRatio: 28,
                        heightRatio: 5,
                        fontSize: 18,
                        fontFamily: 'Roboto',
                      });
                      setIsAddTextMode(false);
                    }}
                    onMouseDown={handleStageMouseDown}
                    onMouseMove={handleStageMouseMove}
                    onMouseUp={handleStageMouseUp}
                    onMouseLeave={handleStageMouseUp}
                  >
                    {thumbnailUrl
                      ? <img
                        src={thumbnailUrl}
                        alt={`PDF page ${currentPage}`}
                        className="pdf-editor-preview-image"
                        onLoad={(event) => {
                          const image = event.currentTarget;
                          if (image.clientHeight > 0) {
                            setStageHeight(image.clientHeight);
                          }
                        }}
                      />
                      : <div className="preview-fallback">No preview for this page</div>}

                    {textLayerSpans.length > 0 && (
                      <div
                        className="pdf-editor-text-layer"
                        aria-label="Text layer for inline editing"
                        style={isAddTextMode || activeShapeTool || drawingDraft ? { pointerEvents: 'none' } : undefined}
                      >
                        {textLayerSpans.map((span) => (
                          <span
                            key={span.id}
                            className="pdf-editor-text-span"
                            style={{
                              left: `${span.xRatio * 100}%`,
                              top: `${span.yRatio * 100}%`,
                              width: `${span.widthRatio * 100}%`,
                              height: `${span.heightRatio * 100}%`,
                              fontSize: `${span.fontSizeRatio * renderStageHeight}px`,
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              createEditFromSpan(span);
                            }}
                          >
                            {span.text}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pdf-editor-shape-layer" aria-hidden="true">
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                        {pageShapeEdits.map((shape) => (
                          shape.type === 'line'
                            ? (
                              <line
                                key={shape.id}
                                x1={shape.x1Ratio}
                                y1={shape.y1Ratio}
                                x2={shape.x2Ratio}
                                y2={shape.y2Ratio}
                                stroke={shape.color}
                                strokeWidth={shape.strokeWidth}
                                strokeOpacity={shape.opacity / 100}
                                strokeLinecap="round"
                              />
                            )
                            : shape.type === 'circle'
                              ? (
                                <ellipse
                                  key={shape.id}
                                  cx={shape.xRatio + (shape.widthRatio / 2)}
                                  cy={shape.yRatio + (shape.heightRatio / 2)}
                                  rx={shape.widthRatio / 2}
                                  ry={shape.heightRatio / 2}
                                  fill="transparent"
                                  stroke={shape.color}
                                  strokeOpacity={shape.opacity / 100}
                                  strokeWidth={shape.strokeWidth}
                                />
                              )
                            : (
                              <rect
                                key={shape.id}
                                x={shape.xRatio}
                                y={shape.yRatio}
                                width={shape.widthRatio}
                                height={shape.heightRatio}
                                fill={shape.type === 'whiteout' ? '#ffffff' : 'transparent'}
                                fillOpacity={shape.type === 'whiteout' ? shape.opacity / 100 : 0}
                                stroke={shape.type === 'whiteout' ? '#ffffff' : shape.color}
                                strokeOpacity={shape.opacity / 100}
                                strokeWidth={shape.strokeWidth}
                              />
                            )
                        ))}
                        {drawingDraft && drawingDraft.pageIndex === currentPage - 1 && (
                          drawingDraft.tool === 'line'
                            ? (
                              <line
                                x1={drawingDraft.startXRatio}
                                y1={drawingDraft.startYRatio}
                                x2={drawingDraft.currentXRatio}
                                y2={drawingDraft.currentYRatio}
                                stroke="#0f172a"
                                strokeWidth={2}
                                strokeOpacity={0.8}
                                strokeDasharray="1.6 1.2"
                              />
                            )
                            : drawingDraft.tool === 'circle'
                              ? (
                                <ellipse
                                  cx={(drawingDraft.startXRatio + drawingDraft.currentXRatio) / 2}
                                  cy={(drawingDraft.startYRatio + drawingDraft.currentYRatio) / 2}
                                  rx={Math.abs(drawingDraft.currentXRatio - drawingDraft.startXRatio) / 2}
                                  ry={Math.abs(drawingDraft.currentYRatio - drawingDraft.startYRatio) / 2}
                                  fill="transparent"
                                  stroke="#0f172a"
                                  strokeWidth={2}
                                  strokeOpacity={0.85}
                                  strokeDasharray="1.6 1.2"
                                />
                              )
                            : (
                              <rect
                                x={Math.min(drawingDraft.startXRatio, drawingDraft.currentXRatio)}
                                y={Math.min(drawingDraft.startYRatio, drawingDraft.currentYRatio)}
                                width={Math.abs(drawingDraft.currentXRatio - drawingDraft.startXRatio)}
                                height={Math.abs(drawingDraft.currentYRatio - drawingDraft.startYRatio)}
                                fill={drawingDraft.tool === 'whiteout' ? '#ffffff' : 'transparent'}
                                fillOpacity={drawingDraft.tool === 'whiteout' ? 0.8 : 0}
                                stroke={drawingDraft.tool === 'whiteout' ? '#ffffff' : '#0f172a'}
                                strokeWidth={2}
                                strokeOpacity={0.85}
                                strokeDasharray="1.6 1.2"
                              />
                            )
                        )}
                      </svg>
                    </div>

                    {pageTextEdits.map((edit) => (
                      <div
                        key={edit.id}
                        className={`pdf-editor-overlay ${edit.id === selectedEditId ? 'active' : ''} ${isAddTextMode || activeShapeTool ? 'selection-disabled' : ''}`}
                        style={{
                          left: `${edit.xRatio}%`,
                          top: `${edit.yRatio}%`,
                          width: `${edit.widthRatio}%`,
                          height: `${edit.heightRatio}%`,
                          color: edit.color,
                          backgroundColor: edit.id === selectedEditId ? edit.backgroundColor : 'transparent',
                          fontSize: `${Math.max((edit.fontSize / 842) * renderStageHeight, (edit.heightRatio / 100) * renderStageHeight * 0.84)}px`,
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedEditId(edit.id);
                        }}
                      >
                        {edit.id === selectedEditId ? (
                          <textarea
                            className="pdf-editor-overlay-input"
                            value={edit.text}
                            autoFocus
                            onChange={(e) => updateSelectedEdit({ text: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="pdf-editor-overlay-text">{edit.text || 'Text'}</span>
                        )}
                      </div>
                    ))}

                    {isLoadingPreview && <div className="pdf-editor-preview-loading">Rendering preview...</div>}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
