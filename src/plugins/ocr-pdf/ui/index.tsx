import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { usePlatform } from '../../../app/react/platform-context';
import { LinearIcon } from '../../../v6/components/icons/linear-icon';

type OcrTab = 'text' | 'json' | 'overlay';
type OcrViewState = 'idle' | 'running' | 'done' | 'error';

interface OcrPreviewMeta {
  accuracy?: number | null;
  pages?: number | null;
  language?: string | null;
  durationMs?: number | null;
}

interface OcrPdfConfigProps {
  inputFiles: string[];
  onStart: (options: Record<string, unknown>) => void;
  onBack: () => void;
  onPickFiles?: (files: File[]) => void | Promise<void>;
  onClearFiles?: () => void;
  viewState?: OcrViewState;
  progress?: number;
  errorMessage?: string | null;
  resultText?: string;
  resultJson?: string;
  resultPdfUrl?: string | null;
  resultMeta?: OcrPreviewMeta;
  onDownloadOutput?: () => void | Promise<void>;
}

function formatDuration(durationMs: number | null | undefined): string {
  if (typeof durationMs !== 'number' || !Number.isFinite(durationMs)) {
    return '-';
  }
  if (durationMs < 1000) {
    return `${Math.round(durationMs)}ms`;
  }
  return `${(durationMs / 1000).toFixed(1)}s`;
}

export default function OcrPdfConfig({
  inputFiles,
  onStart,
  onBack,
  onPickFiles,
  onClearFiles,
  viewState = 'idle',
  progress = 0,
  errorMessage,
  resultText,
  resultJson,
  resultPdfUrl,
  resultMeta,
  onDownloadOutput,
}: OcrPdfConfigProps) {
  const { runtime } = usePlatform();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [dragging, setDragging] = useState(false);
  const [languageMode, setLanguageMode] = useState<'auto' | 'manual'>('auto');
  const [language, setLanguage] = useState('eng');
  const [ocrMode, setOcrMode] = useState<'accurate' | 'fast'>('accurate');
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [detectTables, setDetectTables] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'txt' | 'json' | 'searchable-pdf'>('txt');
  const [activeTab, setActiveTab] = useState<OcrTab>('text');
  const [isTextEditorEnabled, setIsTextEditorEnabled] = useState(false);
  const [editorText, setEditorText] = useState('');
  const hasJsonResult = Boolean(resultJson);
  const hasOverlayResult = Boolean(resultPdfUrl);

  useEffect(() => {
    if (inputFiles.length > 0) {
      void runtime.vfs.read(inputFiles[0]).then((entry) => setFileName(entry.getName()));
      return;
    }
    setFileName('');
  }, [inputFiles, runtime.vfs]);

  useEffect(() => {
    if (outputFormat === 'json' && hasJsonResult) {
      setActiveTab('json');
      return;
    }
    if (outputFormat === 'searchable-pdf' && hasOverlayResult) {
      setActiveTab('overlay');
      return;
    }
    setActiveTab('text');
  }, [hasJsonResult, hasOverlayResult, outputFormat]);

  const hasInput = inputFiles.length > 0;
  const canRun = hasInput && viewState !== 'running';
  const loadingPercent = Math.max(0, Math.min(100, Math.round(progress)));

  const shouldShowResults = useMemo(() => {
    return viewState === 'done' || Boolean(resultText) || hasJsonResult || hasOverlayResult;
  }, [hasJsonResult, hasOverlayResult, resultText, viewState]);

  const previewTabs = useMemo(() => {
    const tabs: Array<{ id: OcrTab; label: string }> = [{ id: 'text', label: 'Text' }];
    if (hasJsonResult) {
      tabs.push({ id: 'json', label: 'JSON' });
    }
    if (hasOverlayResult) {
      tabs.push({ id: 'overlay', label: 'Overlay' });
    }
    return tabs;
  }, [hasJsonResult, hasOverlayResult]);

  useEffect(() => {
    setEditorText(resultText ?? '');
  }, [resultText]);

  useEffect(() => {
    if (previewTabs.some((tab) => tab.id === activeTab)) {
      return;
    }
    setActiveTab(previewTabs[0]?.id ?? 'text');
  }, [activeTab, previewTabs]);

  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    event.target.value = '';
    if (files.length === 0 || !onPickFiles) {
      return;
    }
    await onPickFiles(files);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>): Promise<void> => {
    event.preventDefault();
    setDragging(false);
    if (!onPickFiles) {
      return;
    }
    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length === 0) {
      return;
    }
    await onPickFiles(files);
  };

  const copyCurrentPayload = async (): Promise<void> => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    const payload = activeTab === 'json' ? resultJson : editorText;
    if (!payload) {
      return;
    }
    await navigator.clipboard.writeText(payload);
  };

  return (
    <div className="tool-config-root ocr-concept-root ocr-pdf-concept-root">
      <div className="ocr-concept-workspace">
        <section className="tool-config-card ocr-concept-left ocr-pdf-concept-left">
          <div
            className={`ocr-concept-upload ${dragging ? 'dragging' : ''} ${onPickFiles ? '' : 'upload-readonly'}`}
            onClick={() => {
              if (onPickFiles) {
                inputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              if (!onPickFiles) {
                return;
              }
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => {
              if (onPickFiles) {
                setDragging(false);
              }
            }}
            onDrop={(event) => {
              void handleDrop(event);
            }}
            role={onPickFiles ? 'button' : undefined}
            tabIndex={onPickFiles ? 0 : -1}
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
              accept="application/pdf,image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(event) => {
                void handleFileInput(event);
              }}
            />
            <div className="ocr-concept-upload-icon">
              <LinearIcon name="upload" className="linear-icon icon-md" />
            </div>
            <p className="ocr-concept-upload-title">Drop file here</p>
            <p className="ocr-concept-upload-copy">PDF, JPG, PNG, WEBP. All processing stays local in browser.</p>
            <div className="ocr-concept-file-chip">
              <span className="ocr-concept-file-name">{fileName || 'No file selected'}</span>
              {onClearFiles ? (
                <button
                  type="button"
                  className="ocr-concept-clear-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    onClearFiles();
                  }}
                  aria-label="Clear selected files"
                  title="Clear selected files"
                >
                  <LinearIcon name="x" className="linear-icon" />
                </button>
              ) : (
                <LinearIcon name="refresh" className="linear-icon" />
              )}
            </div>
          </div>

          <div className="ocr-concept-settings">
            <label className="tool-config-label" htmlFor="ocr-language-mode">Language mode</label>
            <select
              id="ocr-language-mode"
              className="tool-config-select"
              value={languageMode}
              onChange={(event) => setLanguageMode(event.target.value === 'manual' ? 'manual' : 'auto')}
            >
              <option value="auto">Auto detect (recommended)</option>
              <option value="manual">Manual selection</option>
            </select>

            <label className="tool-config-label" htmlFor="ocr-language">OCR language</label>
            <select
              id="ocr-language"
              className="tool-config-select"
              value={language}
              disabled={languageMode !== 'manual'}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="rus+eng">Russian + English</option>
              <option value="eng">English</option>
              <option value="rus">Russian</option>
              <option value="ukr">Ukrainian</option>
              <option value="deu">German</option>
              <option value="fra">French</option>
              <option value="spa">Spanish</option>
              <option value="ita">Italian</option>
              <option value="por">Portuguese</option>
              <option value="jpn">Japanese</option>
              <option value="chi_sim">Chinese (Simplified)</option>
              <option value="hin">Hindi</option>
            </select>

            <span className="tool-config-label">Mode</span>
            <div className="ocr-concept-mode-switch" role="radiogroup" aria-label="OCR mode">
              <button
                type="button"
                className={`ocr-concept-mode-option ${ocrMode === 'accurate' ? 'active' : ''}`}
                onClick={() => setOcrMode('accurate')}
                aria-pressed={ocrMode === 'accurate'}
              >
                Accurate
              </button>
              <button
                type="button"
                className={`ocr-concept-mode-option ${ocrMode === 'fast' ? 'active' : ''}`}
                onClick={() => setOcrMode('fast')}
                aria-pressed={ocrMode === 'fast'}
              >
                Fast
              </button>
            </div>

            <div className="ocr-concept-checks">
              <label className="ocr-concept-check">
                <input
                  type="checkbox"
                  checked={preserveFormatting}
                  onChange={(event) => setPreserveFormatting(event.target.checked)}
                />
                Preserve formatting
              </label>
              <label className="ocr-concept-check">
                <input
                  type="checkbox"
                  checked={detectTables}
                  onChange={(event) => setDetectTables(event.target.checked)}
                />
                Detect tables
              </label>
            </div>

            <label className="tool-config-label" htmlFor="ocr-output">Output format</label>
            <select
              id="ocr-output"
              className="tool-config-select"
              value={outputFormat}
              onChange={(event) => {
                const value = event.target.value;
                setOutputFormat(value === 'json' || value === 'searchable-pdf' ? value : 'txt');
              }}
            >
              <option value="txt">TXT report (recommended)</option>
              <option value="searchable-pdf">Searchable PDF (experimental)</option>
              <option value="json">JSON report (advanced)</option>
            </select>
          </div>

          <div className="tool-config-actions ocr-concept-actions">
            <button className="btn-ghost" onClick={onBack}>
              Cancel
            </button>
            <button
              className="btn-primary"
              disabled={!canRun}
              onClick={() => onStart({
                languageMode,
                language,
                outputFormat,
                mode: ocrMode,
                preserveFormatting,
                detectTables,
              })}
            >
              <span className="btn-inline">
                <LinearIcon name="play" className="linear-icon" />
                {viewState === 'running' ? 'Running OCR...' : 'Run OCR'}
              </span>
            </button>
          </div>
        </section>

        <section className="tool-config-card ocr-concept-right">
          {!hasInput && viewState !== 'running' && !shouldShowResults && (
            <div className="ocr-concept-empty">
              <LinearIcon name="ocr" className="linear-icon icon-md" />
              <h3 className="ocr-concept-empty-title">Ready to process OCR</h3>
              <p className="ocr-concept-empty-copy">Upload a document on the left, configure options, then run OCR.</p>
              <div className="ocr-pdf-empty-hint">
                <span className="ocr-pdf-empty-pill">Local runtime only</span>
                <span className="ocr-pdf-empty-pill">Text + JSON + PDF overlay</span>
              </div>
            </div>
          )}

          {viewState === 'running' && (
            <div className="ocr-concept-loading">
              <div className="ocr-concept-spinner" />
              <h3 className="ocr-concept-loading-title">Running OCR...</h3>
              <p className="ocr-concept-loading-copy">Processing in local runtime. Progress: {loadingPercent}%</p>
              <div className="wizard-progress-track ocr-concept-progress-track">
                <div className="wizard-progress-bar" style={{ width: `${loadingPercent}%` }} />
              </div>
            </div>
          )}

          {viewState === 'error' && (
            <div className="ocr-concept-empty">
              <LinearIcon name="x" className="linear-icon icon-md" />
              <h3 className="ocr-concept-empty-title">OCR failed</h3>
              <p className="ocr-concept-empty-copy">{errorMessage || 'Unexpected OCR error.'}</p>
            </div>
          )}

          {shouldShowResults && viewState !== 'running' && (
            <>
              <div className="ocr-concept-tabs" role="tablist" aria-label="OCR preview tabs">
                {previewTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`ocr-concept-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="ocr-concept-toolbar">
                <button type="button" className="ocr-concept-tool-btn" onClick={() => { void copyCurrentPayload(); }}>
                  <LinearIcon name="tool" className="linear-icon" />
                  Copy
                </button>
                <button type="button" className="ocr-concept-tool-btn" onClick={() => { void onDownloadOutput?.(); }}>
                  <LinearIcon name="download" className="linear-icon" />
                  Download
                </button>
                <button type="button" className="ocr-concept-tool-btn" onClick={() => setActiveTab('text')}>
                  <LinearIcon name="refresh" className="linear-icon" />
                  Normalize view
                </button>
                <button
                  type="button"
                  className={`ocr-concept-tool-btn ocr-concept-tool-btn-accent ${isTextEditorEnabled ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('text');
                    setIsTextEditorEnabled((current) => !current);
                  }}
                >
                  <LinearIcon name="refresh" className="linear-icon" />
                  Text editor
                </button>
              </div>

              <div className="ocr-concept-editor" aria-live="polite">
                {activeTab === 'text' && (
                  isTextEditorEnabled ? (
                    <textarea
                      className="ocr-concept-editor-input"
                      value={editorText}
                      onChange={(event) => setEditorText(event.target.value)}
                      placeholder="No text preview available for this output format."
                    />
                  ) : (
                    <pre className="ocr-concept-editor-copy">{editorText || 'No text preview available for this output format.'}</pre>
                  )
                )}
                {activeTab === 'json' && (
                  <pre className="ocr-concept-editor-copy">{resultJson || 'JSON preview is available when output format = JSON.'}</pre>
                )}
                {activeTab === 'overlay' && (
                  resultPdfUrl && (
                    <div className="ocr-concept-pdf-preview-wrap">
                      <iframe
                        className="ocr-concept-pdf-preview"
                        src={`${resultPdfUrl}#toolbar=0&navpanes=0`}
                        title="Searchable PDF preview"
                      />
                      <div className="ocr-concept-pdf-preview-lock" aria-hidden="true" />
                    </div>
                  )
                )}
              </div>

              <div className="ocr-concept-stats">
                <span className="ocr-concept-stat">Accuracy: <strong>{typeof resultMeta?.accuracy === 'number' ? `${resultMeta.accuracy.toFixed(1)}%` : '-'}</strong></span>
                <span className="ocr-concept-stat">Files: <strong>{typeof resultMeta?.pages === 'number' ? resultMeta.pages : inputFiles.length}</strong></span>
                <span className="ocr-concept-stat">Language: <strong>{resultMeta?.language || (languageMode === 'auto' ? 'Auto' : language.toUpperCase())}</strong></span>
                <span className="ocr-concept-stat">Time: <strong>{formatDuration(resultMeta?.durationMs)}</strong></span>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
