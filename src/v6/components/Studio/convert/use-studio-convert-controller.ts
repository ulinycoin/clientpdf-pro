import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../../../../app/react/platform-context';
import { DEFAULT_TOOL_CONTEXT } from '../../../hooks/useWizardFlow';
import { defaultFilePreviewService } from '../../../preview/preview-service';
import { PipelineRunner } from '../../../studio/pipeline/PipelineRunner';
import type { IPipelineRecipe } from '../../../studio/pipeline/types';
import { requestPdfImageCandidates } from '../../../pdf/image-candidate-client';
import type { WorkerPdfImageCandidate } from '../../../../core/public/contracts';
import { createZipBlob } from '../../../utils/zip';
import { type PageItem, type StudioDocument, type StudioState, useStudioStore } from '../studio-store';

export type StudioConvertToolId = 'ocr-pdf' | 'pdf-to-jpg' | 'extract-images' | 'compress-pdf';
export type StudioConvertStep = 'config' | 'processing' | 'result';

export interface StudioOcrSettings {
  languageMode: 'auto' | 'manual';
  language: string;
  mode: 'accurate' | 'fast';
  preserveFormatting: boolean;
  detectTables: boolean;
  outputFormat: 'txt' | 'searchable-pdf' | 'json';
}

export interface StudioPdfToJpgSettings {
  quality: number;
  dpi: number;
}

export interface StudioExtractImagesSettings {
  format: 'png' | 'jpeg';
  jpegQuality: number;
  minWidth: number;
  minHeight: number;
  includeInlineImages: boolean;
  dedupe: boolean;
}

export interface StudioCompressPdfSettings {
  quality: 'low' | 'medium' | 'high';
}

interface StudioConvertPageRef {
  docId: string;
  docName: string;
  pageId: string;
  fileId: string;
  pageIndex: number;
  rotation: number;
  thumbnailUrl: string | null;
}

interface StudioJpgResultItem {
  outputId: string;
  name: string;
  url: string | null;
}

interface StudioOcrResult {
  kind: 'text' | 'json' | 'pdf' | 'unknown';
  content: string | null;
  pdfUrl: string | null;
  fileName: string;
}

interface StudioCompressResultSummary {
  inputBytes: number;
  outputBytes: number;
  outputFileName: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export interface StudioExtractImageCandidate extends WorkerPdfImageCandidate {
  fileId: string;
  pageId: string;
  pageIndex: number;
  globalId: string;
}

function clampZoom(scale: number): number {
  return Math.max(0.35, Math.min(6, scale));
}

function collectSelectedPages(
  documents: StudioDocument[],
  selection: Array<{ docId: string; pageId: string }>,
): StudioConvertPageRef[] {
  const out: StudioConvertPageRef[] = [];
  for (const selected of selection) {
    const doc = documents.find((item) => item.id === selected.docId);
    if (!doc) {
      continue;
    }
    const page = doc.pages.find((item) => item.id === selected.pageId);
    if (!page) {
      continue;
    }
    out.push({
      docId: doc.id,
      docName: doc.name,
      pageId: page.id,
      fileId: page.fileId,
      pageIndex: page.pageIndex,
      rotation: page.rotation ?? 0,
      thumbnailUrl: page.thumbnailUrl || null,
    });
  }
  return out;
}

function collectDocumentPages(doc: StudioDocument): StudioConvertPageRef[] {
  return doc.pages.map((page: PageItem) => ({
    docId: doc.id,
    docName: doc.name,
    pageId: page.id,
    fileId: page.fileId,
    pageIndex: page.pageIndex,
    rotation: page.rotation ?? 0,
    thumbnailUrl: page.thumbnailUrl || null,
  }));
}

async function downloadFileById(
  runtime: ReturnType<typeof usePlatform>['runtime'],
  fileId: string,
  preferredName: string,
): Promise<void> {
  const entry = await runtime.vfs.read(fileId);
  const blob = await entry.getBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = preferredName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function maybeJsonName(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.json');
}

function maybePdfName(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.pdf');
}

export function useStudioConvertController() {
  const { runtime } = usePlatform();
  const navigate = useNavigate();

  const documents = useStudioStore((s: StudioState) => s.documents);
  const selection = useStudioStore((s: StudioState) => s.selection);
  const activeDocumentId = useStudioStore((s: StudioState) => s.activeDocumentId);
  const studioViewScale = useStudioStore((s: StudioState) => s.studioViewScale);
  const studioViewPosition = useStudioStore((s: StudioState) => s.studioViewPosition);
  const setStudioViewport = useStudioStore((s: StudioState) => s.setStudioViewport);
  const setInteractionMode = useStudioStore((s: StudioState) => s.setInteractionMode);

  const [activeTool, setActiveTool] = useState<StudioConvertToolId | null>('ocr-pdf');
  const [step, setStep] = useState<StudioConvertStep>('config');
  const [progress, setProgress] = useState(0);
  const [ocrSettings, setOcrSettings] = useState<StudioOcrSettings>({
    languageMode: 'auto',
    language: 'eng',
    mode: 'accurate',
    preserveFormatting: true,
    detectTables: false,
    outputFormat: 'txt',
  });
  const [pdfToJpgSettings, setPdfToJpgSettings] = useState<StudioPdfToJpgSettings>({
    quality: 92,
    dpi: 150,
  });
  const [extractImagesSettings, setExtractImagesSettings] = useState<StudioExtractImagesSettings>({
    format: 'png',
    jpegQuality: 0.92,
    minWidth: 32,
    minHeight: 32,
    includeInlineImages: true,
    dedupe: true,
  });
  const [compressPdfSettings, setCompressPdfSettings] = useState<StudioCompressPdfSettings>({
    quality: 'medium',
  });
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [thumbnailOverrides, setThumbnailOverrides] = useState<Record<string, string>>({});
  const [zoomLevel, setZoomLevel] = useState(() => clampZoom(studioViewScale || 1));
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [outputIds, setOutputIds] = useState<string[]>([]);
  const [ocrResult, setOcrResult] = useState<StudioOcrResult | null>(null);
  const [compressResultSummary, setCompressResultSummary] = useState<StudioCompressResultSummary | null>(null);
  const [jpgResults, setJpgResults] = useState<StudioJpgResultItem[]>([]);
  const [imageCandidatesByPage, setImageCandidatesByPage] = useState<Record<string, StudioExtractImageCandidate[]>>({});
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [imageScanPendingByPage, setImageScanPendingByPage] = useState<Record<string, boolean>>({});
  const objectUrlsRef = useRef<string[]>([]);
  const imageScanPendingRef = useRef<Record<string, boolean>>({});

  const isRunning = step === 'processing';

  const activeDocument = useMemo(
    () => documents.find((doc) => doc.id === activeDocumentId) ?? null,
    [activeDocumentId, documents],
  );

  const selectedScopePages = useMemo(
    () => collectSelectedPages(documents, selection),
    [documents, selection],
  );

  const operationScope: 'selection' | 'document' = activeTool === 'compress-pdf'
    ? 'document'
    : selectedScopePages.length > 0
      ? 'selection'
      : 'document';
  const targetPages = useMemo<StudioConvertPageRef[]>(() => {
    if (operationScope === 'selection') {
      return selectedScopePages;
    }
    if (!activeDocument) {
      return [];
    }
    return collectDocumentPages(activeDocument);
  }, [activeDocument, operationScope, selectedScopePages]);

  const releaseResultUrls = useCallback(() => {
    for (const url of objectUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    objectUrlsRef.current = [];
  }, []);

  useEffect(() => {
    imageScanPendingRef.current = imageScanPendingByPage;
  }, [imageScanPendingByPage]);

  useEffect(() => {
    setInteractionMode('convert');
  }, [setInteractionMode]);

  useEffect(() => {
    return () => {
      releaseResultUrls();
    };
  }, [releaseResultUrls]);

  useEffect(() => {
    if (targetPages.length === 0) {
      setSelectedPageIds([]);
      setImageCandidatesByPage({});
      setSelectedImageIds([]);
      return;
    }
    if (activeTool === 'compress-pdf') {
      setSelectedPageIds(targetPages.map((page) => page.pageId));
      return;
    }
    setSelectedPageIds((current) => {
      if (current.length === 0) {
        return targetPages.map((page) => page.pageId);
      }
      const allowed = new Set(targetPages.map((page) => page.pageId));
      const filtered = current.filter((pageId) => allowed.has(pageId));
      return filtered.length > 0 ? filtered : targetPages.map((page) => page.pageId);
    });
  }, [activeTool, targetPages]);

  useEffect(() => {
    const allowedPageIds = new Set(targetPages.map((page) => page.pageId));
    setImageCandidatesByPage((current) => {
      const nextEntries = Object.entries(current).filter(([pageId]) => allowedPageIds.has(pageId));
      return nextEntries.length === Object.keys(current).length ? current : Object.fromEntries(nextEntries);
    });
    setSelectedImageIds((current) => current.filter((globalId) => allowedPageIds.has(globalId.split('::', 1)[0] ?? '')));
  }, [targetPages]);

  useEffect(() => {
    setStudioViewport(zoomLevel, studioViewPosition);
  }, [setStudioViewport, studioViewPosition, zoomLevel]);

  useEffect(() => {
    if (activeTool === 'extract-images' && step === 'config') {
      setZoomLevel((current) => (Math.abs(current - 2) < 0.001 ? current : 2));
    }
  }, [activeTool, step]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const entries = await Promise.all(targetPages.map(async (page) => {
        if (page.thumbnailUrl) {
          return { pageId: page.pageId, thumbnailUrl: page.thumbnailUrl };
        }
        try {
          const preview = await defaultFilePreviewService.getPdfPagePreview(runtime, page.fileId, page.pageIndex + 1, { scale: 1.0 });
          return { pageId: page.pageId, thumbnailUrl: preview.thumbnailUrl };
        } catch {
          return { pageId: page.pageId, thumbnailUrl: null };
        }
      }));
      if (cancelled) {
        return;
      }
      setThumbnailOverrides((current) => {
        const next = { ...current };
        for (const entry of entries) {
          if (entry.thumbnailUrl) {
            next[entry.pageId] = entry.thumbnailUrl;
          }
        }
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [runtime, targetPages]);

  const selectedPages = useMemo(() => {
    if (activeTool === 'compress-pdf') {
      return targetPages;
    }
    if (selectedPageIds.length === 0) {
      return [];
    }
    const selected = new Set(selectedPageIds);
    return targetPages.filter((page) => selected.has(page.pageId));
  }, [activeTool, selectedPageIds, targetPages]);

  const previewPages = useMemo(() => {
    return targetPages.map((page) => ({
      ...page,
      thumbnailUrl: thumbnailOverrides[page.pageId] ?? page.thumbnailUrl,
      selected: selectedPageIds.includes(page.pageId),
    }));
  }, [selectedPageIds, targetPages, thumbnailOverrides]);

  const extractImageCandidates = useMemo(
    () => Object.values(imageCandidatesByPage).flat(),
    [imageCandidatesByPage],
  );
  const selectedExtractImageCandidates = useMemo(() => {
    if (selectedImageIds.length === 0) {
      return [];
    }
    const selected = new Set(selectedImageIds);
    return extractImageCandidates.filter((candidate) => selected.has(candidate.globalId));
  }, [extractImageCandidates, selectedImageIds]);

  const togglePage = useCallback((pageId: string) => {
    setSelectedPageIds((current) => (
      current.includes(pageId)
        ? current.filter((id) => id !== pageId)
        : [...current, pageId]
    ));
  }, []);

  const selectAllPages = useCallback(() => {
    setSelectedPageIds(targetPages.map((page) => page.pageId));
  }, [targetPages]);

  const clearPageSelection = useCallback(() => {
    setSelectedPageIds([]);
  }, []);

  const toggleImageCandidate = useCallback((globalId: string) => {
    setSelectedImageIds((current) => (
      current.includes(globalId)
        ? current.filter((id) => id !== globalId)
        : [...current, globalId]
    ));
  }, []);

  const selectAllImageCandidates = useCallback(() => {
    setSelectedImageIds(extractImageCandidates.map((candidate) => candidate.globalId));
  }, [extractImageCandidates]);

  const clearImageCandidateSelection = useCallback(() => {
    setSelectedImageIds([]);
  }, []);

  const zoomIn = useCallback(() => {
    setZoomLevel((value) => clampZoom(value * 1.25));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((value) => clampZoom(value / 1.25));
  }, []);

  const zoomToHundred = useCallback(() => {
    setZoomLevel(1);
  }, []);

  const fitToWidth = useCallback(() => {
    setZoomLevel(1);
  }, []);

  const buildInputForPages = useCallback(async (pages: StudioConvertPageRef[]): Promise<string[]> => {
    if (pages.length === 0) {
      return [];
    }
    const sequence = pages.map((page) => ({
      sourceFileId: page.fileId,
      pageIndex: page.pageIndex,
      rotation: page.rotation,
    }));
    const recipe: IPipelineRecipe = {
      inputs: Array.from(new Set(sequence.map((item) => item.sourceFileId))),
      operations: [{ type: 'reorder', sequence }],
      outputName: 'studio-convert-input.pdf',
    };
    const runner = new PipelineRunner(runtime.vfs);
    const result = await runner.execute(recipe);
    const payload = new Uint8Array(result.buffer.byteLength);
    payload.set(result.buffer);
    const blob = new Blob([payload], { type: 'application/pdf' });
    const entry = await runtime.vfs.write(new File([blob], result.fileName, { type: 'application/pdf' }));
    return [entry.id];
  }, [runtime.vfs]);

  const loadResultView = useCallback(async (tool: StudioConvertToolId, ids: string[], ocrOutputFormat: StudioOcrSettings['outputFormat']) => {
    releaseResultUrls();
    setOcrResult(null);
    setJpgResults([]);

      if (tool === 'pdf-to-jpg' || tool === 'extract-images') {
      const previews = await Promise.all(ids.map(async (outputId) => {
        const entry = await runtime.vfs.read(outputId);
        const preview = await defaultFilePreviewService.getPreview(runtime, outputId);
        return {
          outputId,
          name: entry.getName(),
          url: preview.thumbnailUrl,
        } satisfies StudioJpgResultItem;
      }));
      setJpgResults(previews);
      return;
    }

    const firstOutputId = ids[0];
    if (!firstOutputId) {
      setOcrResult({ kind: 'unknown', content: null, pdfUrl: null, fileName: 'Unknown output' });
      return;
    }

    const entry = await runtime.vfs.read(firstOutputId);
    const fileName = entry.getName();
    const mimeType = await entry.getType();

    const isPdf = mimeType === 'application/pdf' || maybePdfName(fileName) || ocrOutputFormat === 'searchable-pdf';
    if (isPdf) {
      const blob = await entry.getBlob();
      const pdfUrl = URL.createObjectURL(blob);
      objectUrlsRef.current.push(pdfUrl);
      setOcrResult({ kind: 'pdf', content: null, pdfUrl, fileName });
      return;
    }

    const text = await entry.getText();
    const isJson = mimeType === 'application/json' || maybeJsonName(fileName) || ocrOutputFormat === 'json';
    setOcrResult({
      kind: isJson ? 'json' : 'text',
      content: text,
      pdfUrl: null,
      fileName,
    });
  }, [releaseResultUrls, runtime]);

  const updateOcrResultContent = useCallback((content: string) => {
    setOcrResult((current) => current ? { ...current, content } : null);
  }, []);

  const resetWorkspace = useCallback(() => {
    releaseResultUrls();
    setStep('config');
    setProgress(0);
    setError(null);
    setMessage(null);
    setOutputIds([]);
    setOcrResult(null);
    setCompressResultSummary(null);
    setJpgResults([]);
    setImageScanPendingByPage({});
  }, [releaseResultUrls]);

  useEffect(() => {
    if (activeTool !== 'extract-images' || step !== 'config') {
      return;
    }
    const pagesToScan = selectedPages.filter((page) => (
      !imageCandidatesByPage[page.pageId]
      && !imageScanPendingRef.current[page.pageId]
    ));
    if (pagesToScan.length === 0) {
      return;
    }
    for (const page of pagesToScan) {
      const abortController = new AbortController();
      imageScanPendingRef.current = { ...imageScanPendingRef.current, [page.pageId]: true };
      setImageScanPendingByPage((current) => ({ ...current, [page.pageId]: true }));
      void (async () => {
        try {
          const candidates = await requestPdfImageCandidates(runtime, page.fileId, page.pageIndex + 1, abortController.signal);
          if (abortController.signal.aborted) {
            return;
          }
          const mapped = candidates.map((candidate) => ({
            ...candidate,
            fileId: page.fileId,
            pageId: page.pageId,
            pageIndex: page.pageIndex,
            globalId: `${page.pageId}::${candidate.id}`,
          }));
          setImageCandidatesByPage((current) => ({ ...current, [page.pageId]: mapped }));
        } catch (scanError) {
          if (!abortController.signal.aborted) {
            setError(scanError instanceof Error ? scanError.message : 'Failed to scan PDF images.');
          }
        } finally {
          imageScanPendingRef.current = Object.fromEntries(
            Object.entries(imageScanPendingRef.current).filter(([pageId]) => pageId !== page.pageId),
          );
          setImageScanPendingByPage((current) => {
            const next = { ...current };
            delete next[page.pageId];
            return next;
          });
        }
      })();
    }
  }, [activeTool, imageCandidatesByPage, runtime, selectedPages, step]);

  useEffect(() => {
    if (activeTool !== 'extract-images') {
      return;
    }
    const selectedPageSet = new Set(selectedPageIds);
    setSelectedImageIds((current) => current.filter((globalId) => selectedPageSet.has(globalId.split('::', 1)[0] ?? '')));
  }, [activeTool, selectedPageIds]);

  const runTool = useCallback(async () => {
    if (!activeTool || selectedPages.length === 0 || isRunning) {
      return;
    }

    resetWorkspace();
    setStep('processing');

    try {
      const inputIds = activeTool === 'extract-images'
        ? Array.from(new Set(selectedPages.map((page) => page.fileId)))
        : activeTool === 'compress-pdf'
          ? Array.from(new Set(targetPages.map((page) => page.fileId)))
          : await buildInputForPages(selectedPages);
      if (inputIds.length === 0) {
        setError('No pages selected for conversion.');
        setStep('config');
        return;
      }
      if (activeTool === 'extract-images' && selectedExtractImageCandidates.length === 0) {
        setError('No images selected for extraction.');
        setStep('config');
        return;
      }

      const options: Record<string, unknown> = activeTool === 'ocr-pdf'
        ? {
          languageMode: ocrSettings.languageMode,
          language: ocrSettings.language,
          mode: ocrSettings.mode,
          outputFormat: ocrSettings.outputFormat,
          preserveFormatting: ocrSettings.preserveFormatting,
          detectTables: ocrSettings.detectTables,
        }
        : activeTool === 'pdf-to-jpg'
          ? {
            quality: pdfToJpgSettings.quality,
            dpi: pdfToJpgSettings.dpi,
          }
          : activeTool === 'compress-pdf'
            ? {
              quality: compressPdfSettings.quality,
            }
          : {
            format: extractImagesSettings.format,
            jpegQuality: extractImagesSettings.jpegQuality,
            minWidth: extractImagesSettings.minWidth,
            minHeight: extractImagesSettings.minHeight,
            includeInlineImages: extractImagesSettings.includeInlineImages,
            dedupe: extractImagesSettings.dedupe,
            selectedCandidates: selectedExtractImageCandidates.map((candidate) => ({
              fileId: candidate.fileId,
              pageNumber: candidate.pageNumber,
              candidateId: candidate.id,
            })),
          };

      const result = await runtime.runner.execute(
        activeTool,
        { inputIds, options },
        DEFAULT_TOOL_CONTEXT,
        (event) => {
          if (event.type === 'TOOL_PROGRESS') {
            setProgress(Math.max(0, Math.min(100, Math.round(event.progress))));
          }
        },
      );

      if (result.type === 'TOOL_ACCESS_DENIED') {
        setError(result.details ?? result.reason);
        setStep('config');
        return;
      }
      if (result.type === 'TOOL_ERROR') {
        setError(result.message);
        setStep('config');
        return;
      }

      setProgress(100);
      setOutputIds(result.outputIds);
      await loadResultView(activeTool, result.outputIds, ocrSettings.outputFormat);
      if (activeTool === 'compress-pdf') {
        const inputEntries = await Promise.all(inputIds.map((inputId) => runtime.vfs.read(inputId)));
        const outputEntry = result.outputIds[0] ? await runtime.vfs.read(result.outputIds[0]) : null;
        const inputBytes = (await Promise.all(inputEntries.map((entry) => entry.getSize()))).reduce((sum, value) => sum + value, 0);
        const outputBytes = outputEntry ? await outputEntry.getSize() : 0;
        setCompressResultSummary({
          inputBytes,
          outputBytes,
          outputFileName: outputEntry?.getName() ?? 'document-compressed.pdf',
        });
      }
      setMessage(
        activeTool === 'ocr-pdf'
          ? 'OCR completed.'
          : activeTool === 'pdf-to-jpg'
            ? 'PDF to JPG completed.'
            : activeTool === 'compress-pdf'
              ? 'Compression completed.'
              : 'Image extraction completed.',
      );
      setStep('result');
    } catch (runError) {
      const runMessage = runError instanceof Error ? runError.message : 'Conversion failed.';
      setError(runMessage);
      setStep('config');
    }
  }, [
    activeTool,
    buildInputForPages,
    isRunning,
    loadResultView,
    ocrSettings.detectTables,
    ocrSettings.language,
    ocrSettings.languageMode,
    ocrSettings.mode,
    ocrSettings.outputFormat,
    ocrSettings.preserveFormatting,
    extractImagesSettings.dedupe,
    extractImagesSettings.format,
    extractImagesSettings.includeInlineImages,
    extractImagesSettings.jpegQuality,
    extractImagesSettings.minHeight,
    extractImagesSettings.minWidth,
    pdfToJpgSettings.dpi,
    pdfToJpgSettings.quality,
    compressPdfSettings.quality,
    resetWorkspace,
    runtime.runner,
    selectedExtractImageCandidates,
    selectedPages,
    targetPages,
  ]);

  const downloadResults = useCallback(async () => {
    const baseDocName = activeDocument?.name || 'converted';

    if (activeTool === 'ocr-pdf' && ocrResult && (ocrResult.kind === 'text' || ocrResult.kind === 'json')) {
      const extension = ocrResult.kind === 'json' ? '.json' : '.txt';
      const text = ocrResult.content || '';
      const blob = new Blob([text], { type: ocrResult.kind === 'json' ? 'application/json' : 'text/plain' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${baseDocName}${extension}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      return;
    }

    if (activeTool === 'extract-images' && outputIds.length > 2) {
      const zipEntries = await Promise.all(outputIds.map(async (outputId) => {
        const entry = await runtime.vfs.read(outputId);
        return {
          name: entry.getName(),
          blob: await entry.getBlob(),
        };
      }));
      const zipBlob = await createZipBlob(zipEntries);
      const url = URL.createObjectURL(zipBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${baseDocName || 'images'}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      return;
    }

    for (let i = 0; i < outputIds.length; i++) {
      const outputId = outputIds[i];
      const suffix = outputIds.length > 1 ? `_${i + 1}` : '';
      const entry = await runtime.vfs.read(outputId);
      const preferredName = activeTool === 'extract-images'
        ? entry.getName()
        : `${baseDocName}${suffix}${activeTool === 'pdf-to-jpg' ? '.jpg' : '.pdf'}`;
      await downloadFileById(runtime, outputId, preferredName);
    }
  }, [activeDocument?.name, activeTool, ocrResult, outputIds, runtime]);

  const navigateBack = useCallback(() => {
    setInteractionMode('convert');
    navigate('/studio');
  }, [navigate, setInteractionMode]);

  return {
    activeDocument,
    activeTool,
    setActiveTool,
    step,
    progress,
    ocrSettings,
    setOcrSettings,
    pdfToJpgSettings,
    setPdfToJpgSettings,
    extractImagesSettings,
    setExtractImagesSettings,
    compressPdfSettings,
    setCompressPdfSettings,
    operationScope,
    previewPages,
    imageCandidatesByPage,
    selectedImageIds,
    extractImageCandidates,
    selectedExtractImageCandidates,
    imageScanPendingByPage,
    selectedPageIds,
    selectedPages,
    togglePage,
    selectAllPages,
    clearPageSelection,
    toggleImageCandidate,
    selectAllImageCandidates,
    clearImageCandidateSelection,
    zoomLevel,
    setZoomLevel,
    zoomIn,
    zoomOut,
    zoomToHundred,
    fitToWidth,
    isRunning,
    error,
    setError,
    message,
    setMessage,
    outputIds,
    ocrResult,
    compressResultSummary,
    jpgResults,
    updateOcrResultContent,
    runTool,
    downloadResults,
    resetWorkspace,
    navigateBack,
    formatBytes,
  };
}
