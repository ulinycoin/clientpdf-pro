import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { usePlatform } from '../../../app/react/platform-context';
import { LinearIcon } from '../../../v6/components/icons/linear-icon';
import { defaultFilePreviewService } from '../../../v6/preview/preview-service';

interface PdfToJpgConfigProps {
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

export default function PdfToJpgConfig({
  inputFiles,
  onStart,
  onBack,
  onPickFiles,
  onClearFiles,
  currentStep,
  progress = 0,
  outputCount = 0,
  onDownload,
}: PdfToJpgConfigProps) {
  const { runtime } = usePlatform();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'preview' | 'details'>('preview');
  const [previewThumbs, setPreviewThumbs] = useState<Array<{ page: number; url: string }>>([]);
  const [previewPageCount, setPreviewPageCount] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    const loadNames = async () => {
      const names = await Promise.all(
        inputFiles.map(async (id) => {
          const entry = await runtime.vfs.read(id);
          return entry.getName();
        }),
      );
      setFileNames(names);
    };
    void loadNames();
  }, [inputFiles, runtime.vfs]);

  useEffect(() => {
    let cancelled = false;

    const loadPreview = async (): Promise<void> => {
      if (inputFiles.length === 0) {
        setPreviewThumbs([]);
        setPreviewPageCount(null);
        setPreviewLoading(false);
        setPreviewError(null);
        return;
      }

      setPreviewLoading(true);
      setPreviewError(null);

      try {
        const fileId = inputFiles[0];
        const basePreview = await defaultFilePreviewService.getPreview(runtime, fileId);
        if (basePreview.kind !== 'pdf') {
          throw new Error('Preview is available only for PDF files.');
        }

        const pageCount = Math.max(1, basePreview.pageCount ?? 1);
        const pagesToRender = Math.min(3, pageCount);
        const thumbs: Array<{ page: number; url: string }> = [];

        for (let page = 1; page <= pagesToRender; page++) {
          const rendered = await defaultFilePreviewService.getPdfPagePreview(runtime, fileId, page, { scale: 1.0 });
          if (rendered.thumbnailUrl) {
            thumbs.push({ page, url: rendered.thumbnailUrl });
          }
        }

        if (cancelled) {
          return;
        }

        if (thumbs.length === 0) {
          throw new Error('Failed to render PDF preview pages.');
        }

        setPreviewThumbs(thumbs);
        setPreviewPageCount(pageCount);
      } catch (error) {
        if (cancelled) {
          return;
        }
        const message = error instanceof Error && error.message.trim().length > 0
          ? error.message
          : 'Preview is unavailable for this file.';
        setPreviewThumbs([]);
        setPreviewPageCount(null);
        setPreviewError(message);
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    void loadPreview();
    return () => {
      cancelled = true;
    };
  }, [inputFiles, runtime]);

  const hasInput = fileNames.length > 0;
  const isProcessing = currentStep === 'processing';
  const hasResult = currentStep === 'result' && outputCount > 0;
  const canRun = hasInput && !isProcessing;

  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    event.target.value = '';
    if (files.length === 0 || !onPickFiles) {
      return;
    }
    await onPickFiles(files);
  };

  return (
    <div className="tool-config-root jpg-concept-root">
      <div className="ocr-concept-workspace">
        <section className="tool-config-card ocr-concept-left jpg-concept-left">
          <h3 className="jpg-concept-title">PDF to JPG conversion</h3>

          <p className="tool-config-copy">
            Convert pages from <strong>{inputFiles.length}</strong> PDF file{inputFiles.length === 1 ? '' : 's'} into JPG images.
          </p>

          <div
            className={`ocr-concept-upload ${onPickFiles ? '' : 'upload-readonly'}`}
            role={onPickFiles ? 'button' : undefined}
            tabIndex={onPickFiles ? 0 : -1}
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
              style={{ display: 'none' }}
              onChange={(event) => {
                void handleFileInput(event);
              }}
            />
            <div className="ocr-concept-upload-icon">
              <LinearIcon name="image" className="linear-icon icon-md" />
            </div>
            <p className="ocr-concept-upload-title">Drop file or click to upload</p>
            <p className="ocr-concept-upload-copy">PDF only. Each page converts to a separate JPG.</p>

            <div className="ocr-concept-file-chip">
              <span className="ocr-concept-file-name">
                {hasInput ? `${fileNames.length} file(s): ${fileNames.join(', ')}` : 'No files selected'}
              </span>
              {hasInput && onClearFiles ? (
                <button
                  type="button"
                  className="ocr-concept-clear-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    void onClearFiles();
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

          <div className="tool-config-card jpg-concept-info-card">
            <p className="tool-config-copy" style={{ margin: 0 }}>
              Each PDF page is exported as a separate JPG file. Final files are available on the result step.
            </p>
          </div>

          <div className="tool-config-actions ocr-concept-actions">
            <button className="btn-ghost" onClick={onBack}>
              Cancel
            </button>
            <button
              className="btn-primary"
              disabled={hasResult ? false : !canRun}
              onClick={() => {
                if (hasResult && onDownload) {
                  void onDownload();
                  return;
                }
                onStart({});
              }}
            >
              {hasResult ? 'Download JPG' : (isProcessing ? `Converting ${Math.max(0, Math.min(100, Math.round(progress)))}%` : 'Run PDF to JPG')}
            </button>
          </div>
        </section>

        <section className="tool-config-card ocr-concept-right">
          {!hasInput ? (
            <div className="ocr-concept-empty">
              <LinearIcon name="image" className="linear-icon icon-md" />
              <h4 className="ocr-concept-empty-title">PDF to JPG</h4>
              <p className="ocr-concept-empty-copy">Add PDF files on the previous step to generate JPG previews.</p>
            </div>
          ) : (
            <>
              <div className="ocr-concept-tabs" role="tablist" aria-label="PDF to JPG tabs">
                <button
                  type="button"
                  className={`ocr-concept-tab ${activeTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('preview')}
                >
                  Preview
                </button>
                <button
                  type="button"
                  className={`ocr-concept-tab ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
              </div>

              <div className="ocr-concept-editor">
                {activeTab === 'preview' ? (
                  previewLoading ? (
                    <pre className="ocr-concept-editor-copy">Rendering PDF preview...</pre>
                  ) : previewError ? (
                    <pre className="ocr-concept-editor-copy">{`Preview error: ${previewError}`}</pre>
                  ) : (
                    <div className="jpg-concept-preview-grid">
                      {previewThumbs.map((thumb) => (
                        <div key={`jpg-preview-${thumb.page}`} className="jpg-concept-preview-card">
                          <img
                            className="jpg-concept-preview-image"
                            src={thumb.url}
                            alt={`Preview of PDF page ${thumb.page}`}
                          />
                          <span className="jpg-concept-preview-label">{`Page ${thumb.page}.jpg`}</span>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="jpg-concept-details">
                    <div className="jpg-concept-details-row">
                      <span className="jpg-concept-details-label">Input files</span>
                      <span className="jpg-concept-details-value">{fileNames.length}</span>
                    </div>
                    <div className="jpg-concept-details-row">
                      <span className="jpg-concept-details-label">Output format</span>
                      <span className="jpg-concept-details-value">JPG per page</span>
                    </div>
                    <div className="jpg-concept-details-row">
                      <span className="jpg-concept-details-label">Execution mode</span>
                      <span className="jpg-concept-details-value">Local browser runtime</span>
                    </div>
                    <div className="jpg-concept-details-row">
                      <span className="jpg-concept-details-label">Selected files</span>
                      <span className="jpg-concept-details-value">{fileNames.join(', ')}</span>
                    </div>
                    <div className="jpg-concept-details-row">
                      <span className="jpg-concept-details-label">Preview pages</span>
                      <span className="jpg-concept-details-value">
                        {previewPageCount ? `${Math.min(3, previewPageCount)} of ${previewPageCount}` : '-'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
