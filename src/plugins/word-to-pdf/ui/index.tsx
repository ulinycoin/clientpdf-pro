import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { usePlatform } from '../../../app/react/platform-context';
import { LinearIcon } from '../../../v6/components/icons/linear-icon';

interface WordToPdfConfigProps {
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

export default function WordToPdfConfig({
  inputFiles,
  onStart,
  onBack,
  onPickFiles,
  onClearFiles,
  currentStep,
  progress = 0,
  outputCount = 0,
  onDownload,
}: WordToPdfConfigProps) {
  const { runtime } = usePlatform();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'pdf' | 'details'>('pdf');
  const [quality, setQuality] = useState<'standard' | 'high' | 'min'>('standard');
  const [pdfA, setPdfA] = useState(false);
  const [searchablePdf, setSearchablePdf] = useState(true);
  const [protectWithPassword, setProtectWithPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [previewPageUrls, setPreviewPageUrls] = useState<string[]>([]);
  const [activePreviewPage, setActivePreviewPage] = useState(0);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isPreviewDragActive, setIsPreviewDragActive] = useState(false);

  const isNodeRuntime = typeof process !== 'undefined' && Boolean(process.versions?.node);

  useEffect(() => {
    const loadNames = async () => {
      const names = await Promise.all(
        inputFiles.map(async (id) => {
          const e = await runtime.vfs.read(id);
          return e.getName();
        }),
      );
      setFileNames(names);
    };
    void loadNames();
  }, [inputFiles, runtime.vfs]);

  useEffect(() => {
    let cancelled = false;
    let nextPageUrls: string[] = [];

    const revokeUrls = (urls: string[]): void => {
      if (typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') {
        return;
      }
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };

    const clearPreviewImages = (): void => {
      setPreviewPageUrls((current) => {
        revokeUrls(current);
        return [];
      });
      setActivePreviewPage(0);
    };

    const loadPreview = async (): Promise<void> => {
      if (inputFiles.length === 0) {
        setPreviewText('');
        setPreviewError(null);
        setIsPreviewLoading(false);
        clearPreviewImages();
        return;
      }

      if (typeof document === 'undefined') {
        setPreviewText('Preview is unavailable in this runtime.');
        setPreviewError(null);
        setIsPreviewLoading(false);
        clearPreviewImages();
        return;
      }

      setIsPreviewLoading(true);
      setPreviewError(null);

      try {
        const mammoth = await import('mammoth');

        const entry = await runtime.vfs.read(inputFiles[0]);
        const blob = await entry.getBlob();
        const arrayBuffer = await blob.arrayBuffer();

        const text = await mammoth.extractRawText({ arrayBuffer });
        const normalized = text.value
          .replace(/\r/g, '')
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .slice(0, 28)
          .join('\n');
        if (!cancelled) {
          setPreviewText(normalized.length > 0 ? normalized : 'No readable text found in this DOCX file.');
        }

        const margin = quality === 'high' ? 28 : (quality === 'min' ? 18 : 22);
        const fontSize = quality === 'high' ? 18 : (quality === 'min' ? 14 : 16);
        const lineStep = quality === 'high' ? 30 : (quality === 'min' ? 23 : 26);
        const previewWidth = 860;
        const previewHeight = 1120;
        const maxTextWidth = previewWidth - margin * 2;
        const lines = (normalized || 'No readable text found in this DOCX file.').split('\n');

        const measureCanvas = document.createElement('canvas');
        measureCanvas.width = previewWidth;
        measureCanvas.height = previewHeight;
        const context = measureCanvas.getContext('2d');
        if (!context) {
          throw new Error('Preview canvas is unavailable.');
        }

        context.textBaseline = 'top';
        context.font = `${fontSize}px "Noto Sans", Arial, sans-serif`;
        const wrappedLines: string[] = [];
        for (const line of lines) {
          const value = line.trim().length > 0 ? line : ' ';
          const words = value.split(/\s+/);
          let current = '';
          for (const word of words) {
            const candidate = current.length > 0 ? `${current} ${word}` : word;
            if (context.measureText(candidate).width <= maxTextWidth) {
              current = candidate;
            } else {
              wrappedLines.push(current.length > 0 ? current : word);
              current = current.length > 0 ? word : '';
            }
          }
          if (current.length > 0) {
            wrappedLines.push(current);
          } else {
            wrappedLines.push(' ');
          }
        }

        const maxLinesPerPage = Math.max(1, Math.floor((previewHeight - margin * 2) / lineStep));
        const pages: string[][] = [];
        for (let start = 0; start < wrappedLines.length; start += maxLinesPerPage) {
          pages.push(wrappedLines.slice(start, start + maxLinesPerPage));
        }
        if (pages.length === 0) {
          pages.push(['No readable text found in this DOCX file.']);
        }

        const pageUrls: string[] = [];
        for (const pageLines of pages) {
          const canvas = document.createElement('canvas');
          canvas.width = previewWidth;
          canvas.height = previewHeight;
          const pageContext = canvas.getContext('2d');
          if (!pageContext) {
            continue;
          }
          pageContext.fillStyle = '#ffffff';
          pageContext.fillRect(0, 0, previewWidth, previewHeight);
          pageContext.fillStyle = '#0f172a';
          pageContext.textBaseline = 'top';
          pageContext.font = `${fontSize}px "Noto Sans", Arial, sans-serif`;

          let y = margin;
          for (const line of pageLines) {
            pageContext.fillText(line, margin, y, maxTextWidth);
            y += lineStep;
          }

          pageContext.strokeStyle = 'rgba(15, 23, 42, 0.14)';
          pageContext.lineWidth = 2;
          pageContext.strokeRect(1, 1, previewWidth - 2, previewHeight - 2);

          const imageBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
          if (!imageBlob) {
            continue;
          }
          pageUrls.push(URL.createObjectURL(imageBlob));
        }

        if (pageUrls.length === 0) {
          throw new Error('Failed to create preview image.');
        }

        nextPageUrls = pageUrls;
        if (!cancelled) {
          setPreviewPageUrls((current) => {
            revokeUrls(current);
            return pageUrls;
          });
          setActivePreviewPage((current) => Math.max(0, Math.min(current, pageUrls.length - 1)));
          nextPageUrls = [];
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        const message = error instanceof Error && error.message.trim().length > 0
          ? error.message
          : 'Preview is unavailable for this file.';
        setPreviewError(message);
        clearPreviewImages();
      } finally {
        if (!cancelled) {
          setIsPreviewLoading(false);
        }
      }
    };

    void loadPreview();
    return () => {
      cancelled = true;
      revokeUrls(nextPageUrls);
    };
  }, [inputFiles, pdfA, quality, runtime.vfs]);

  useEffect(() => {
    if (!isNodeRuntime && protectWithPassword) {
      setProtectWithPassword(false);
      setPassword('');
    }
  }, [isNodeRuntime, protectWithPassword]);

  const primaryName = fileNames[0] ?? 'No file selected';
  const outputName = useMemo(() => {
    if (fileNames.length === 0) {
      return 'converted.pdf';
    }
    const sourceName = fileNames[0];
    const dotIndex = sourceName.lastIndexOf('.');
    const baseName = dotIndex > 0 ? sourceName.slice(0, dotIndex) : sourceName;
    return `${baseName}.pdf`;
  }, [fileNames]);

  const isProcessing = currentStep === 'processing';
  const hasResult = currentStep === 'result' && outputCount > 0;
  const canRun = fileNames.length > 0 && (!protectWithPassword || password.trim().length > 0) && !isProcessing;

  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    event.target.value = '';
    if (files.length === 0 || !onPickFiles) {
      return;
    }
    await onPickFiles(files);
  };

  const handlePreviewFiles = async (files: File[]): Promise<void> => {
    if (files.length === 0 || !onPickFiles) {
      return;
    }
    await onPickFiles(files);
  };

  return (
    <div className="tool-config-root word-concept-root">
      <div className="ocr-concept-workspace">
        <section className="tool-config-card ocr-concept-left word-concept-left">
          <h3 className="word-concept-title">Conversion settings</h3>

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
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: 'none' }}
              onChange={(event) => {
                void handleFileInput(event);
              }}
            />
            <span className="ocr-concept-upload-icon" aria-hidden="true">
              <LinearIcon name="word" className="linear-icon icon-md" />
            </span>
            <p className="ocr-concept-upload-title">Drop files or click to upload</p>
            <p className="ocr-concept-upload-copy">DOCX only. Processing runs locally in browser.</p>
          </div>

          <div className="ocr-concept-file-chip">
            <div className="word-concept-file-name-group">
              <LinearIcon name="word" className="linear-icon" />
              <span className="ocr-concept-file-name">{primaryName}</span>
            </div>
            {fileNames.length > 0 && onClearFiles && (
              <button
                type="button"
                className="ocr-concept-clear-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  void onClearFiles();
                }}
                aria-label="Clear selected file"
              >
                <LinearIcon name="x" className="linear-icon" />
              </button>
          )}
          </div>

          <div className="ocr-concept-settings">
            <label className="tool-config-label" htmlFor="word-quality">Quality and size</label>
            <select
              id="word-quality"
              className="tool-config-select"
              value={quality}
              onChange={(event) => setQuality(event.target.value as 'standard' | 'high' | 'min')}
            >
              <option value="standard">Standard (screen and print)</option>
              <option value="high">High quality (print ready)</option>
              <option value="min">Minimum size (email)</option>
            </select>

            <div className="ocr-concept-checks">
              <label className="ocr-concept-check">
                <input type="checkbox" checked={pdfA} onChange={(event) => setPdfA(event.target.checked)} />
                Create PDF/A (archive mode)
              </label>

              <label className="ocr-concept-check">
                <input
                  type="checkbox"
                  checked={searchablePdf}
                  onChange={(event) => setSearchablePdf(event.target.checked)}
                />
                Searchable PDF (best effort)
              </label>

              <label className="ocr-concept-check">
                <input
                  type="checkbox"
                  checked={protectWithPassword}
                  disabled={!isNodeRuntime}
                  onChange={(event) => setProtectWithPassword(event.target.checked)}
                />
                Protect with password {isNodeRuntime ? '' : '(desktop runtime only)'}
              </label>
            </div>

            {protectWithPassword && (
              <input
                className="tool-config-input"
                type="password"
                placeholder="Enter password to open PDF"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            )}
          </div>

          <div className="tool-config-actions ocr-concept-actions">
            <button className="btn-ghost" onClick={onBack}>
              Cancel
            </button>
            <button
              className="btn-primary btn-inline"
              disabled={hasResult ? false : !canRun}
              onClick={() => {
                if (hasResult && onDownload) {
                  void onDownload();
                  return;
                }
                onStart({
                  quality,
                  pdfA,
                  searchablePdf,
                  protectWithPassword,
                  password: password.trim(),
                });
              }}
            >
              <LinearIcon name={hasResult ? 'download' : 'play'} className="linear-icon" />
              {isProcessing ? `Converting ${Math.max(0, Math.min(100, Math.round(progress)))}%` : hasResult ? 'Download PDF' : 'Convert to PDF'}
            </button>
          </div>
        </section>

        <section
          className={`tool-config-card ocr-concept-right ${isPreviewDragActive ? 'word-preview-drop-active' : ''}`}
          onDragOver={(event) => {
            if (!onPickFiles) {
              return;
            }
            event.preventDefault();
            setIsPreviewDragActive(true);
          }}
          onDragLeave={() => setIsPreviewDragActive(false)}
          onDrop={(event) => {
            if (!onPickFiles) {
              return;
            }
            event.preventDefault();
            setIsPreviewDragActive(false);
            const files = Array.from(event.dataTransfer.files ?? []);
            void handlePreviewFiles(files);
          }}
        >
          {fileNames.length === 0 ? (
            <div
              className={`ocr-concept-empty ${onPickFiles ? 'word-preview-upload-target' : ''}`}
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
              <LinearIcon name="word" className="linear-icon icon-md" />
              <h4 className="ocr-concept-empty-title">Word to PDF</h4>
              <p className="ocr-concept-empty-copy">Drop DOCX here or click to upload. Then review preview on the right.</p>
            </div>
          ) : (
            <>
              <div className="ocr-concept-tabs" role="tablist" aria-label="Word preview tabs">
                <button
                  type="button"
                  className={`ocr-concept-tab ${activeTab === 'pdf' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pdf')}
                >
                  PDF
                </button>
                <button
                  type="button"
                  className={`ocr-concept-tab ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
              </div>

              <div className="ocr-concept-toolbar">
                {previewPageUrls.length > 1 && (
                  <div className="word-preview-pager">
                    <button
                      type="button"
                      className="ocr-concept-tool-btn"
                      onClick={() => setActivePreviewPage((page) => Math.max(0, page - 1))}
                      disabled={activePreviewPage <= 0}
                    >
                      Prev
                    </button>
                    <select
                      className="tool-config-select word-preview-select"
                      value={activePreviewPage}
                      onChange={(event) => setActivePreviewPage(Number(event.target.value))}
                    >
                      {previewPageUrls.map((_, index) => (
                        <option key={`preview-page-${index + 1}`} value={index}>
                          Page {index + 1}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="ocr-concept-tool-btn"
                      onClick={() => setActivePreviewPage((page) => Math.min(previewPageUrls.length - 1, page + 1))}
                      disabled={activePreviewPage >= previewPageUrls.length - 1}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              <div className="ocr-concept-editor">
                {activeTab === 'pdf' ? (
                  isPreviewLoading ? (
                    <pre className="ocr-concept-editor-copy">Preparing DOCX preview...</pre>
                  ) : previewError ? (
                    <pre className="ocr-concept-editor-copy">{`Preview error: ${previewError}`}</pre>
                  ) : previewPageUrls.length > 0 ? (
                    <img
                      className="word-concept-preview-image"
                      src={previewPageUrls[activePreviewPage] ?? previewPageUrls[0]}
                      alt={`Generated PDF preview page ${activePreviewPage + 1}`}
                    />
                  ) : (
                    <pre className="ocr-concept-editor-copy">{previewText}</pre>
                  )
                ) : (
                  <pre className="ocr-concept-editor-copy">{`Input: ${primaryName}
Output: ${outputName}
Quality: ${quality}
PDF/A: ${pdfA ? 'enabled' : 'disabled'}
Searchable PDF (requested): ${searchablePdf ? 'enabled' : 'disabled'}
Searchable result: best effort (some scripts/symbols may be rasterized)
Password protection: ${protectWithPassword ? 'enabled' : 'disabled'}
Password mode: ${isNodeRuntime ? 'available' : 'browser runtime - unavailable'}
Preview text lines: ${previewText.length === 0 ? 0 : previewText.split('\n').length}`}</pre>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
