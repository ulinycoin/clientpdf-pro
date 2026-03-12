import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ToolRunContext } from '../../core/public/contracts';
import { usePlatform } from './platform-context';
import { downloadOutputFiles } from '../platform/download-output-files';
import type { StudioToolRouteState } from '../../v6/studio/navigation/studio-tool-context';

const OcrPdfConfig = lazy(() => import('../../plugins/ocr-pdf/ui'));

interface ParsedRunPreview {
  text: string;
  json: string;
  accuracy: number | null;
  language: string | null;
}

const demoContext: ToolRunContext = {
  userId: 'ocr-test-user',
  plan: 'pro',
  entitlements: ['pdf.ocr'],
};

export function OcrPdfTestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { runtime } = usePlatform();

  const [inputIds, setInputIds] = useState<string[]>([]);
  const [outputIds, setOutputIds] = useState<string[]>([]);
  const [viewState, setViewState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParsedRunPreview>({
    text: '',
    json: '',
    accuracy: null,
    language: null,
  });

  const resultMeta = useMemo(() => ({
    accuracy: preview.accuracy,
    pages: inputIds.length,
    language: preview.language,
    durationMs,
  }), [durationMs, inputIds.length, preview.accuracy, preview.language]);

  useEffect(() => {
    return () => {
      if (resultPdfUrl) {
        URL.revokeObjectURL(resultPdfUrl);
      }
    };
  }, [resultPdfUrl]);

  useEffect(() => {
    const routeState = (location.state as StudioToolRouteState | null) ?? null;
    const preloadedFileIds = Array.isArray(routeState?.preloadedFileIds)
      ? routeState.preloadedFileIds.filter((value): value is string => typeof value === 'string' && value.length > 0)
      : [];

    if (routeState?.source !== 'studio' || preloadedFileIds.length === 0) {
      return;
    }

    setInputIds(Array.from(new Set(preloadedFileIds)));
    setOutputIds([]);
    if (resultPdfUrl) {
      URL.revokeObjectURL(resultPdfUrl);
      setResultPdfUrl(null);
    }
    setPreview({ text: '', json: '', accuracy: null, language: null });
    setProgress(0);
    setDurationMs(null);
    setErrorMessage(null);
    setViewState('idle');
  }, [location.key, location.state]);

  const handlePickFiles = async (files: File[]): Promise<void> => {
    const nextIds: string[] = [];
    for (const file of files) {
      const entry = await runtime.vfs.write(file);
      nextIds.push(entry.id);
    }
    setInputIds(nextIds);
    setOutputIds([]);
    if (resultPdfUrl) {
      URL.revokeObjectURL(resultPdfUrl);
      setResultPdfUrl(null);
    }
    setPreview({ text: '', json: '', accuracy: null, language: null });
    setProgress(0);
    setDurationMs(null);
    setErrorMessage(null);
    setViewState('idle');
  };

  const handleClearFiles = (): void => {
    setInputIds([]);
    setOutputIds([]);
    setPreview({ text: '', json: '', accuracy: null, language: null });
    setProgress(0);
    setDurationMs(null);
    setErrorMessage(null);
    setViewState('idle');
  };

  const handleRun = async (options: Record<string, unknown>): Promise<void> => {
    if (inputIds.length === 0) {
      setViewState('error');
      setErrorMessage('Select at least one file before running OCR.');
      return;
    }

    setViewState('running');
    setProgress(0);
    setErrorMessage(null);
    if (resultPdfUrl) {
      URL.revokeObjectURL(resultPdfUrl);
      setResultPdfUrl(null);
    }
    setPreview({ text: '', json: '', accuracy: null, language: null });

    const startedAt = performance.now();
    const result = await runtime.runner.execute(
      'ocr-pdf',
      { inputIds, options },
      demoContext,
      (event) => {
        setProgress(event.progress);
      },
    );

    setDurationMs(performance.now() - startedAt);

    if (result.type === 'TOOL_ACCESS_DENIED') {
      setViewState('error');
      setErrorMessage(result.details ?? result.reason);
      return;
    }

    if (result.type === 'TOOL_ERROR') {
      setViewState('error');
      setErrorMessage(result.message);
      return;
    }

    setOutputIds(result.outputIds);

    const firstOutputId = result.outputIds[0];
    if (!firstOutputId) {
      setViewState('done');
      return;
    }

    const entry = await runtime.vfs.read(firstOutputId);
    const blob = await entry.getBlob();
    const mime = await entry.getType();

    if (mime === 'text/plain') {
      const text = await blob.text();
      setPreview({ text, json: '', accuracy: null, language: null });
      setViewState('done');
      return;
    }

    if (mime === 'application/json') {
      const raw = await blob.text();
      let recognizedText = '';
      let accuracy: number | null = null;
      let language: string | null = null;

      try {
        const parsed = JSON.parse(raw) as {
          recognizedText?: unknown;
          ocr?: { averageConfidence?: unknown };
          languageDetection?: { primaryLanguage?: unknown };
        };
        recognizedText = typeof parsed.recognizedText === 'string' ? parsed.recognizedText : '';
        accuracy = typeof parsed.ocr?.averageConfidence === 'number' ? parsed.ocr.averageConfidence * 100 : null;
        language = typeof parsed.languageDetection?.primaryLanguage === 'string'
          ? parsed.languageDetection.primaryLanguage.toUpperCase()
          : null;
      } catch {
        recognizedText = '';
      }

      setPreview({
        text: recognizedText,
        json: raw,
        accuracy,
        language,
      });
      setViewState('done');
      return;
    }

    if (mime === 'application/pdf') {
      const pdfUrl = URL.createObjectURL(blob);
      setPreview({
        text: 'Searchable PDF generated. Use Download to save the output file.',
        json: '',
        accuracy: null,
        language: null,
      });
      setResultPdfUrl(pdfUrl);
      setViewState('done');
      return;
    }

    setPreview({ text: '', json: '', accuracy: null, language: null });
    setViewState('done');
  };

  const handleDownload = async (): Promise<void> => {
    if (outputIds.length === 0) {
      return;
    }
    await downloadOutputFiles(runtime, outputIds, { baseName: 'ocr-result' });
  };

  return (
    <div className="wizard-shell ocr-test-shell">
      <div className="wizard-header ocr-test-header">
        <div>
          <h1 className="wizard-title">OCR PDF</h1>
        </div>
      </div>

      <div className="wizard-config-card animate-fade-in ocr-test-config-card">
        <Suspense fallback={<p className="wizard-subtitle">Loading OCR concept...</p>}>
          <OcrPdfConfig
            inputFiles={inputIds}
            onBack={() => navigate('/ocr-pdf')}
            onStart={(options) => {
              void handleRun(options);
            }}
            onPickFiles={(files) => {
              void handlePickFiles(files);
            }}
            onClearFiles={handleClearFiles}
            viewState={viewState}
            progress={progress}
            errorMessage={errorMessage}
            resultText={preview.text}
            resultJson={preview.json}
            resultPdfUrl={resultPdfUrl}
            resultMeta={resultMeta}
            onDownloadOutput={() => {
              void handleDownload();
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
