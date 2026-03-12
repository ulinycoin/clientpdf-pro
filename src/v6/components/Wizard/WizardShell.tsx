import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  type KeyboardEvent,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../../../app/react/platform-context';
import { LinearIcon } from '../icons/linear-icon';
import { DEFAULT_TOOL_CONTEXT, useWizardFlow } from '../../hooks/useWizardFlow';
import { useFilePreviews } from '../../hooks/use-file-previews';
import { PreviewPanel } from './PreviewPanel';
import type { IOAdapter, SmartUploadZoneProps, WizardShellProps } from './types';
import type { StudioReturnContext, StudioSelectedPageRef, StudioToolRouteState } from '../../studio/navigation/studio-tool-context';
import { getPdfLib } from '../../services/pdf/pdf-loader';

function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function AnimatePresence({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>;
}

class ConfigErrorBoundary extends Component<
  { onRetry: () => void; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { onRetry: () => void; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  handleRetry = (): void => {
    this.setState({ hasError: false });
    this.props.onRetry();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="wizard-config-card" style={{ borderColor: 'rgba(175, 47, 37, 0.32)', background: '#fff4f2', color: '#7c2920' }}>
          <p className="mb-3 text-sm">Failed to load tool settings.</p>
          <button className="btn-secondary" onClick={this.handleRetry}>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function SmartUploadZone({ disabled, accept = 'application/pdf', multiple = true, onFilesAdded }: SmartUploadZoneProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pushFiles = async (fileList: FileList | null): Promise<void> => {
    if (!fileList || fileList.length === 0 || disabled) {
      return;
    }
    await onFilesAdded(Array.from(fileList));
  };

  const onDrop = async (event: DragEvent<HTMLDivElement>): Promise<void> => {
    event.preventDefault();
    setIsDragging(false);
    await pushFiles(event.dataTransfer.files);
  };

  const onInput = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    await pushFiles(event.target.files);
    event.target.value = '';
  };

  return (
    <div
      className={classNames('upload-zone', isDragging && 'dragging', disabled && 'disabled')}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      aria-label="Upload files"
      title="Upload files"
    >
      <div className="upload-zone-badge">
        <LinearIcon name="upload" className="linear-icon icon-md" />
      </div>
      <p className="upload-zone-title">Drop files here or click to upload</p>
      <p className="upload-zone-copy">All files are written to VFS immediately.</p>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={onInput} disabled={disabled} />
    </div>
  );
}

function createBrowserIOAdapter(runtime: ReturnType<typeof usePlatform>['runtime']): IOAdapter {
  return {
    async save(fileId: string): Promise<void> {
      const entry = await runtime.vfs.read(fileId);
      const blob = await entry.getBlob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = entry.getName();
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    },
  };
}

const PROCESSING_VERB_BY_TOOL: Record<string, string> = {
  'merge-pdf': 'Merging',
  'split-pdf': 'Splitting',
  'rotate-pdf': 'Rotating',
  'delete-pages-pdf': 'Deleting pages',
  'pdf-editor': 'Applying edits',
  'compress-pdf': 'Compressing',
  'ocr-pdf': 'Scanning',
  'pdf-to-jpg': 'Converting',
  'word-to-pdf': 'Converting',
  'excel-to-pdf': 'Converting',
  'encrypt-pdf': 'Encrypting',
  'protect-pdf': 'Protecting',
  'unlock-pdf': 'Unlocking',
};

const COMPLETION_BY_TOOL: Record<string, string> = {
  'merge-pdf': 'Merge complete',
  'split-pdf': 'Split complete',
  'rotate-pdf': 'Rotation complete',
  'delete-pages-pdf': 'Delete pages complete',
  'pdf-editor': 'Edits applied',
  'compress-pdf': 'Compression complete',
  'ocr-pdf': 'OCR complete',
  'pdf-to-jpg': 'Conversion complete',
  'word-to-pdf': 'Conversion complete',
  'excel-to-pdf': 'Conversion complete',
  'encrypt-pdf': 'Encryption complete',
  'protect-pdf': 'Protection complete',
  'unlock-pdf': 'Unlock complete',
};

function getProcessingLabel(toolId: string): string {
  return PROCESSING_VERB_BY_TOOL[toolId] ?? 'Processing';
}

function getResultLabel(toolId: string): string {
  return COMPLETION_BY_TOOL[toolId] ?? 'Action complete';
}

async function buildSinglePageInputIdsFromSelection(
  runtime: ReturnType<typeof usePlatform>['runtime'],
  selectedPages: StudioSelectedPageRef[],
): Promise<string[]> {
  const sourceBytesByFileId = new Map<string, Uint8Array>();
  const outputIds: string[] = [];

  for (const selected of selectedPages) {
    if (!Number.isInteger(selected.pageIndex) || selected.pageIndex < 0) {
      continue;
    }

    let sourceBytes = sourceBytesByFileId.get(selected.fileId);
    if (!sourceBytes) {
      const sourceEntry = await runtime.vfs.read(selected.fileId);
      const sourceBlob = await sourceEntry.getBlob();
      sourceBytes = new Uint8Array(await sourceBlob.arrayBuffer());
      sourceBytesByFileId.set(selected.fileId, sourceBytes);
    }

    const { PDFDocument } = await getPdfLib();
    const sourcePdf = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
    if (selected.pageIndex >= sourcePdf.getPageCount()) {
      continue;
    }

    const pageOnlyPdf = await PDFDocument.create();
    const [copiedPage] = await pageOnlyPdf.copyPages(sourcePdf, [selected.pageIndex]);
    pageOnlyPdf.addPage(copiedPage);

    const outputBytes = new Uint8Array(await pageOnlyPdf.save());
    const outputFile = new File(
      [outputBytes],
      `studio-page-${selected.pageIndex + 1}.pdf`,
      { type: 'application/pdf' },
    );
    const outputEntry = await runtime.vfs.write(outputFile);
    outputIds.push(outputEntry.id);
  }

  return outputIds;
}

export function WizardShell({ toolId, context = DEFAULT_TOOL_CONTEXT, ioAdapter, limitService }: WizardShellProps): JSX.Element {
  const { runtime } = usePlatform();
  const navigate = useNavigate();
  const location = useLocation();
  const [configBoundaryKey, setConfigBoundaryKey] = useState(0);

  const {
    state,
    configComponent,
    handleFilesAdded,
    hydrateFromFileIds,
    startProcessing,
    cancelProcessing,
    resetFlow,
    retryConfigLoad,
    dismissToast,
    dismissUpsell,
  } = useWizardFlow(toolId, { context, limitService });

  const toolDef = runtime.registry.get(toolId);
  const ConfigComponent = configComponent;
  const WordConfigComponent = ConfigComponent as ComponentType<any> | null;
  const previewFileIds = state.step === 'result' ? state.outputIds : state.fileIds;
  const { previews, isLoading: isPreviewLoading } = useFilePreviews(runtime, toolId, previewFileIds);
  const isSplitLayout = (state.step === 'config' || state.step === 'result') && toolDef.layout === 'split';
  const uiRunId = useMemo(() => `wizard-ui-${crypto.randomUUID()}`, []);
  const io = useMemo(() => ioAdapter ?? createBrowserIOAdapter(runtime), [ioAdapter, runtime]);
  const uploadAccept = useMemo(() => {
    if (toolId === 'word-to-pdf') {
      return '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    if (toolId === 'excel-to-pdf') {
      return '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
    if (toolId === 'ocr-pdf') {
      return 'application/pdf,image/*';
    }
    return 'application/pdf';
  }, [toolId]);
  const allowMultiple = useMemo(() => !['pdf-to-jpg', 'split-pdf'].includes(toolId), [toolId]);
  const routeState = (location.state as StudioToolRouteState | null) ?? null;
  const isStudioFlow = routeState?.source === 'studio';
  const routeStudioContext = routeState?.studioContext;
  const routeReturnContext = routeState?.studioReturnContext;
  const isInlineUploadConfigFlow = toolId === 'word-to-pdf' || toolId === 'excel-to-pdf' || toolId === 'pdf-to-jpg' || toolId === 'pdf-editor';
  const isWordSinglePageFlow = toolId === 'word-to-pdf' || toolId === 'excel-to-pdf' || (toolId === 'pdf-to-jpg' && !isStudioFlow) || toolId === 'pdf-editor';
  const allowStandaloneFlow = toolId === 'word-to-pdf' || toolId === 'excel-to-pdf';
  const requiresStudioFlow = !allowStandaloneFlow;

  const buildReturnContext = (): StudioReturnContext | undefined => routeReturnContext;

  const navigateToStudio = (includeResult: boolean): void => {
    navigate('/studio', {
      state: {
        source: 'studio',
        studioReturnContext: buildReturnContext(),
        ...(includeResult
          ? {
            studioToolResult: {
              toolId,
              outputIds: state.outputIds,
              studioContext: routeStudioContext,
            },
          }
          : {}),
      } satisfies StudioToolRouteState,
    });
  };

  const handleBackAction = (): void => {
    if (isStudioFlow) {
      navigateToStudio(false);
      return;
    }
    void resetFlow(true);
  };

  const handleWordFilesPicked = useCallback(
    async (files: File[]): Promise<void> => {
      if (files.length === 0) {
        return;
      }
      if (state.fileIds.length > 0) {
        await resetFlow(true);
      }
      await handleFilesAdded(files);
    },
    [handleFilesAdded, resetFlow, state.fileIds.length],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const preloadedFileIds = Array.isArray(routeState?.preloadedFileIds)
        ? routeState.preloadedFileIds.filter((value): value is string => typeof value === 'string' && value.length > 0)
        : [];
      const selectedPages = routeStudioContext?.mode === 'page-selection'
        ? routeStudioContext.selectedPages
        : [];

      let inputIds = preloadedFileIds;
      if (selectedPages.length > 0) {
        try {
          const extractedIds = await buildSinglePageInputIdsFromSelection(runtime, selectedPages);
          if (extractedIds.length > 0) {
            inputIds = extractedIds;
          }
        } catch (error) {
          console.error('Failed to prepare selected Studio pages for tool input:', error);
        }
      }

      if (cancelled || inputIds.length === 0) {
        return;
      }
      await hydrateFromFileIds(inputIds);
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrateFromFileIds, location.key, routeState?.preloadedFileIds, routeStudioContext, runtime]);

  const startProcessingWithContext = (payload?: Record<string, unknown>): Promise<void> => {
    if (!routeStudioContext) {
      return startProcessing(payload);
    }
    return startProcessing({
      ...(payload ?? {}),
      studioContext: routeStudioContext,
    });
  };

  useEffect(() => {
    if (!state.toast) {
      return;
    }
    runtime.telemetry.track({
      type: 'UI_TOAST_SHOWN',
      runId: uiRunId,
      toolId,
      message: state.toast,
      level: 'error',
    });
    dismissToast();
  }, [dismissToast, runtime.telemetry, state.toast, toolId, uiRunId]);

  useEffect(() => {
    if (!state.upsellReason) {
      return;
    }
    dismissUpsell();
  }, [dismissUpsell, state.upsellReason]);

  if (requiresStudioFlow && !isStudioFlow) {
    return (
      <section className="wizard-shell">
        <header className="wizard-header">
          <div>
            <h2 className="wizard-title">{toolDef.name}</h2>
          </div>
        </header>
        <div className="wizard-config-card">
          <p className="wizard-subtitle">
            This workflow is Studio-first. Select a document in Studio and launch the tool from there.
          </p>
          <div className="tool-config-actions">
            <button className="btn-primary" onClick={() => navigate('/studio')}>
              Go to Studio
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={classNames(
        'wizard-shell',
        isSplitLayout && 'wizard-shell-workspace',
        (toolId === 'word-to-pdf' || toolId === 'excel-to-pdf') && 'wizard-shell-fullwidth',
      )}
    >
      <header className="wizard-header">
        <div>
          <h2 className="wizard-title">{toolDef.name}</h2>
        </div>
      </header>

      {state.error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 wizard-error-banner">{state.error}</div>
      )}

      {!isWordSinglePageFlow && !isSplitLayout && toolId !== 'excel-to-pdf' && toolId !== 'pdf-editor' && (
        <PreviewPanel
          runtime={runtime}
          previews={previews}
          isLoading={isPreviewLoading}
          toolId={toolId}
          title={state.step === 'result' ? 'Result Preview' : 'Preview'}
        />
      )}

      <AnimatePresence>
        {isWordSinglePageFlow && WordConfigComponent && (
          <div className="animate-fade-in wizard-config-card">
            <ConfigErrorBoundary
              onRetry={() => {
                retryConfigLoad();
                setConfigBoundaryKey((current) => current + 1);
              }}
              key={configBoundaryKey}
            >
              <Suspense fallback={<p className="wizard-subtitle">Loading configuration...</p>}>
                <WordConfigComponent
                  inputFiles={state.fileIds}
                  onStart={startProcessingWithContext}
                  onBack={handleBackAction}
                  onPickFiles={state.isProcessing ? undefined : handleWordFilesPicked}
                  onClearFiles={() => void resetFlow(true)}
                  currentStep={state.step}
                  progress={state.progress}
                  outputCount={state.outputIds.length}
                  onDownload={
                    isStudioFlow
                      ? undefined
                      : () => {
                        void Promise.all(state.outputIds.map(async (fileId) => io.save(fileId)));
                      }
                  }
                />
              </Suspense>
            </ConfigErrorBoundary>
          </div>
        )}

        {!isWordSinglePageFlow && state.step === 'upload' && (
          isInlineUploadConfigFlow && ConfigComponent ? (
            <div className="animate-fade-in wizard-config-card">
              <ConfigErrorBoundary
                onRetry={() => {
                  retryConfigLoad();
                  setConfigBoundaryKey((current) => current + 1);
                }}
                key={configBoundaryKey}
              >
                <Suspense fallback={<p className="wizard-subtitle">Loading configuration...</p>}>
                  <ConfigComponent
                    inputFiles={state.fileIds}
                    onStart={startProcessingWithContext}
                    onBack={handleBackAction}
                    onPickFiles={handleWordFilesPicked}
                    onClearFiles={() => void resetFlow(true)}
                  />
                </Suspense>
              </ConfigErrorBoundary>
            </div>
          ) : (
            <div className="animate-fade-in wizard-upload-card">
              <SmartUploadZone
                onFilesAdded={handleFilesAdded}
                disabled={state.isValidating}
                multiple={allowMultiple}
                accept={uploadAccept}
              />
              {state.isValidating && <p className="wizard-subtitle" style={{ marginTop: '0.75rem' }}>Validating access limits...</p>}
              {isStudioFlow && (
                <div className="wizard-action-row" style={{ marginTop: '0.75rem' }}>
                  <button className="btn-ghost" onClick={handleBackAction}>
                    Back to Studio
                  </button>
                </div>
              )}
            </div>
          )
        )}

        {!isWordSinglePageFlow && state.step === 'config' && ConfigComponent && (
          <div className="animate-fade-in wizard-config-card">
            {isSplitLayout ? (
              <div className="wizard-config-split">
                <div className="wizard-config-preview-pane">
                  <PreviewPanel
                    runtime={runtime}
                    previews={previews}
                    isLoading={isPreviewLoading}
                    toolId={toolId}
                    title="Preview"
                  />
                </div>
                <div className="wizard-config-controls-pane">
                  <ConfigErrorBoundary
                    onRetry={() => {
                      retryConfigLoad();
                      setConfigBoundaryKey((current) => current + 1);
                    }}
                    key={configBoundaryKey}
                  >
                    <Suspense fallback={<p className="wizard-subtitle">Loading configuration...</p>}>
                      <ConfigComponent
                        inputFiles={state.fileIds}
                        onStart={startProcessingWithContext}
                        onBack={handleBackAction}
                        onPickFiles={isInlineUploadConfigFlow ? handleWordFilesPicked : undefined}
                        onClearFiles={isInlineUploadConfigFlow ? (() => void resetFlow(true)) : undefined}
                      />
                    </Suspense>
                  </ConfigErrorBoundary>
                </div>
              </div>
            ) : (
              <ConfigErrorBoundary
                onRetry={() => {
                  retryConfigLoad();
                  setConfigBoundaryKey((current) => current + 1);
                }}
                key={configBoundaryKey}
              >
                <Suspense fallback={<p className="wizard-subtitle">Loading configuration...</p>}>
                  <ConfigComponent
                    inputFiles={state.fileIds}
                    onStart={startProcessingWithContext}
                    onBack={handleBackAction}
                    onPickFiles={isInlineUploadConfigFlow ? handleWordFilesPicked : undefined}
                    onClearFiles={isInlineUploadConfigFlow ? (() => void resetFlow(true)) : undefined}
                  />
                </Suspense>
              </ConfigErrorBoundary>
            )}
          </div>
        )}

        {!isWordSinglePageFlow && state.step === 'processing' && (
          <div className="animate-fade-in wizard-processing-card" style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0 }}>{getProcessingLabel(toolId)}...</h3>
            <p className="wizard-subtitle">{getProcessingLabel(toolId)} your file in local worker runtime.</p>
            <div className="wizard-progress-track">
              <div className="wizard-progress-bar" style={{ width: `${state.progress}%` }} />
            </div>
            <p style={{ marginTop: '0.5rem', fontWeight: 700 }}>{state.progress}%</p>
            <div className="wizard-action-row">
              <button className="btn-danger" onClick={cancelProcessing}>
                <span className="btn-inline">
                  <LinearIcon name="x" className="linear-icon" />
                  Cancel
                </span>
              </button>
            </div>
          </div>
        )}

        {!isWordSinglePageFlow && state.step === 'result' && (
          <div className="animate-fade-in wizard-result-card" style={{ textAlign: 'center' }}>
            {isSplitLayout ? (
              <div className="wizard-result-split">
                <div className="wizard-result-preview-pane">
                  <PreviewPanel
                    runtime={runtime}
                    previews={previews}
                    isLoading={isPreviewLoading}
                    toolId={toolId}
                    title="Result Preview"
                  />
                </div>
                <div className="wizard-result-controls-pane">
                  <h3 style={{ margin: 0, color: 'var(--ok)' }}>Ready!</h3>
                  <p className="wizard-subtitle">
                    {getResultLabel(toolId)}. {state.outputIds.length} file(s) generated.
                  </p>
                  <div className="wizard-action-row wizard-action-col">
                    {!isStudioFlow && (
                      <button
                        className="btn-primary"
                        onClick={() => {
                          void Promise.all(state.outputIds.map(async (fileId) => io.save(fileId)));
                        }}
                      >
                        <span className="btn-inline">
                          <LinearIcon name="download" className="linear-icon" />
                          {state.outputIds.length > 1 ? 'Download ZIP' : 'Download File'}
                        </span>
                      </button>
                    )}
                    <button className="btn-ghost" onClick={() => void resetFlow(true)}>
                      <span className="btn-inline">
                        <LinearIcon name="refresh" className="linear-icon" />
                        Start over
                      </span>
                    </button>
                    {isStudioFlow && (
                      <button
                        className="btn-primary"
                        onClick={() => navigateToStudio(true)}
                      >
                        <span className="btn-inline">
                          <LinearIcon name="tool" className="linear-icon" />
                          Save to Studio
                        </span>
                      </button>
                    )}
                    {isStudioFlow && (
                      <button className="btn-secondary" onClick={() => navigateToStudio(false)}>
                        <span className="btn-inline">
                          <LinearIcon name="x" className="linear-icon" />
                          Discard and Return
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h3 style={{ margin: 0, color: 'var(--ok)' }}>Ready!</h3>
                <p className="wizard-subtitle">
                  {getResultLabel(toolId)}. {state.outputIds.length} file(s) generated.
                </p>
                <div className="wizard-action-row">
                  {!isStudioFlow && (
                    <button
                      className="btn-primary"
                      onClick={() => {
                        void Promise.all(state.outputIds.map(async (fileId) => io.save(fileId)));
                      }}
                    >
                      <span className="btn-inline">
                        <LinearIcon name="download" className="linear-icon" />
                        {state.outputIds.length > 1 ? 'Download ZIP' : 'Download File'}
                      </span>
                    </button>
                  )}
                  <button className="btn-ghost" onClick={() => void resetFlow(true)}>
                    <span className="btn-inline">
                      <LinearIcon name="refresh" className="linear-icon" />
                      Start over
                    </span>
                  </button>
                  {isStudioFlow && (
                    <button
                      className="btn-primary"
                      onClick={() => navigateToStudio(true)}
                    >
                      <span className="btn-inline">
                        <LinearIcon name="tool" className="linear-icon" />
                        Save to Studio
                      </span>
                    </button>
                  )}
                  {isStudioFlow && (
                    <button className="btn-secondary" onClick={() => navigateToStudio(false)}>
                      <span className="btn-inline">
                        <LinearIcon name="x" className="linear-icon" />
                        Discard and Return
                      </span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export { SmartUploadZone };
