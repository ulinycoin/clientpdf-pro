import { GlobalRegistry } from '../registry/global-registry';
import { getPdfPageCountFromBytes } from '../pdf/page-count';
import { NoopTelemetrySink, type TelemetrySink } from '../telemetry/telemetry';
import type {
  IWorkerCommand,
  IWorkerEvent,
  IFileSystem,
  RunnerProgressEvent,
  RunnerExecuteResult,
  ToolRunContext,
  ToolRunInput,
} from '../types/contracts';
import type { WorkerOrchestrator } from '../workers/worker-orchestrator';

type AccessDeniedResult = Extract<RunnerExecuteResult, { type: 'TOOL_ACCESS_DENIED' }>;
type PageCountFallbackMode = 'off' | 'limited' | 'on';

export class UnifiedToolRunner {
  private pageCountTimeoutMs: number;
  private firstPageCountTimeoutMs: number;
  private pageCountChecksPerformed = 0;
  private readonly pageCountFallbackMode: PageCountFallbackMode;

  constructor(
    private readonly registry: GlobalRegistry,
    private readonly workerOrchestrator: WorkerOrchestrator,
    private readonly fileSystem: IFileSystem,
    private readonly telemetry: TelemetrySink = new NoopTelemetrySink(),
    options?: { pageCountTimeoutMs?: number; firstPageCountTimeoutMs?: number; pageCountFallbackMode?: PageCountFallbackMode },
  ) {
    this.pageCountTimeoutMs = options?.pageCountTimeoutMs ?? 5_000;
    this.firstPageCountTimeoutMs = options?.firstPageCountTimeoutMs ?? options?.pageCountTimeoutMs ?? 10_000;
    this.pageCountFallbackMode = options?.pageCountFallbackMode ?? 'limited';
  }

  async execute(
    toolId: string,
    input: ToolRunInput,
    context: ToolRunContext,
    onProgress?: (event: RunnerProgressEvent) => void,
  ): Promise<RunnerExecuteResult> {
    let accessCheck: AccessDeniedResult | null;
    try {
      accessCheck = await this.validateAccess(toolId, input.inputIds, context);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Access check failed';
      const typed = error as { code?: unknown };
      const code = typeof typed.code === 'string' ? typed.code : 'ACCESS_CHECK_FAILED';
      const runId = `access-check-${crypto.randomUUID()}`;
      this.telemetry.track({
        type: 'TOOL_RUN_ERROR',
        runId,
        toolId,
        durationMs: 0,
        code,
        message,
      });
      this.publishErrorToast(runId, toolId, message);
      return { type: 'TOOL_ERROR', message, code };
    }
    if (accessCheck) {
      return accessCheck;
    }

    const runId = crypto.randomUUID();
    const startedAt = Date.now();
    if (this.shouldRunInProcess(toolId)) {
      return this.executeInProcess(toolId, input, runId, startedAt, onProgress);
    }

    const command: IWorkerCommand = {
      id: crypto.randomUUID(),
      type: 'COMMAND',
      payload: {
        type: 'PROCESS_TOOL',
        payload: { toolId, inputIds: input.inputIds, options: input.options },
      },
    };

    let event;
    try {
      event = await this.workerOrchestrator.dispatch(command, (workerEvent) => {
        if (workerEvent.payload.type === 'PROGRESS') {
          this.telemetry.track({
            type: 'TOOL_RUN_PROGRESS',
            runId,
            toolId,
            progress: workerEvent.payload.payload.progress,
          });
          onProgress?.({
            type: 'TOOL_PROGRESS',
            progress: workerEvent.payload.payload.progress,
          });
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected worker dispatch failure';
      this.telemetry.track({
        type: 'TOOL_RUN_ERROR',
        runId,
        toolId,
        durationMs: Date.now() - startedAt,
        code: 'WORKER_DISPATCH_FAILED',
        message,
      });
      this.publishErrorToast(runId, toolId, message);
      return { type: 'TOOL_ERROR', message, code: 'WORKER_DISPATCH_FAILED' };
    }
    if (event.payload.type === 'RESULT') {
      this.telemetry.track({
        type: 'TOOL_RUN_RESULT',
        runId,
        toolId,
        durationMs: Date.now() - startedAt,
        outputCount: event.payload.payload.outputIds.length,
      });
      return { type: 'TOOL_RESULT', outputIds: event.payload.payload.outputIds };
    }
    if (event.payload.type === 'ERROR') {
      this.telemetry.track({
        type: 'TOOL_RUN_ERROR',
        runId,
        toolId,
        durationMs: Date.now() - startedAt,
        code: event.payload.payload.code,
        message: event.payload.payload.message,
      });
      this.publishErrorToast(runId, toolId, event.payload.payload.message);
      return {
        type: 'TOOL_ERROR',
        message: event.payload.payload.message,
        code: event.payload.payload.code,
      };
    }
    this.telemetry.track({
      type: 'TOOL_RUN_ERROR',
      runId,
      toolId,
      durationMs: Date.now() - startedAt,
      code: 'INVALID_WORKER_EVENT',
      message: 'Unexpected worker event type',
    });
    this.publishErrorToast(runId, toolId, 'Unexpected worker event type');
    return { type: 'TOOL_ERROR', message: 'Unexpected worker event type', code: 'INVALID_WORKER_EVENT' };
  }

  private shouldRunInProcess(toolId: string): boolean {
    return toolId === 'ocr-pdf';
  }

  private async executeInProcess(
    toolId: string,
    input: ToolRunInput,
    runId: string,
    startedAt: number,
    onProgress?: (event: RunnerProgressEvent) => void,
  ): Promise<RunnerExecuteResult> {
    try {
      const definition = this.registry.get(toolId);
      const logicModule = await definition.logicLoader();
      const output = await logicModule.run({
        inputIds: input.inputIds,
        options: input.options,
        fs: this.fileSystem,
        emitProgress: (progress) => {
          this.telemetry.track({
            type: 'TOOL_RUN_PROGRESS',
            runId,
            toolId,
            progress,
          });
          onProgress?.({ type: 'TOOL_PROGRESS', progress });
        },
      });
      this.telemetry.track({
        type: 'TOOL_RUN_RESULT',
        runId,
        toolId,
        durationMs: Date.now() - startedAt,
        outputCount: output.outputIds.length,
      });
      return { type: 'TOOL_RESULT', outputIds: output.outputIds };
    } catch (error) {
      const typed = error as { code?: unknown; message?: unknown };
      const code = typeof typed.code === 'string' ? typed.code : 'TOOL_EXECUTION_FAILED';
      const message = typeof typed.message === 'string' ? typed.message : 'Tool execution failed';
      this.telemetry.track({
        type: 'TOOL_RUN_ERROR',
        runId,
        toolId,
        durationMs: Date.now() - startedAt,
        code,
        message,
      });
      this.publishErrorToast(runId, toolId, message);
      return { type: 'TOOL_ERROR', message, code };
    }
  }

  private publishErrorToast(runId: string, toolId: string, message: string): void {
    this.telemetry.track({
      type: 'UI_TOAST_SHOWN',
      runId,
      toolId,
      message,
      level: 'error',
    });
  }

  private publishUpsell(runId: string, toolId: string, reason: string): void {
    this.telemetry.track({
      type: 'UI_UPSELL_SHOWN',
      runId,
      toolId,
      reason,
    });
  }

  async validateAccess(
    toolId: string,
    inputIds: string[],
    context: ToolRunContext,
  ): Promise<AccessDeniedResult | null> {
    const definition = this.registry.get(toolId);
    const runId = `access-check-${crypto.randomUUID()}`;

    this.telemetry.track({
      type: 'TOOL_RUN_STARTED',
      runId,
      toolId,
      inputCount: inputIds.length,
    });

    const entitlementCheck = this.checkEntitlements(definition.entitlements, context.entitlements);
    if (entitlementCheck) {
      this.telemetry.track({
        type: 'TOOL_RUN_DENIED',
        runId,
        toolId,
        reason: entitlementCheck.reason,
      });
      this.publishUpsell(runId, toolId, entitlementCheck.details ?? entitlementCheck.reason);
      return entitlementCheck;
    }

    const tierCheck = this.checkFeatureTier(definition.limits?.featureTier, context.plan);
    if (tierCheck) {
      this.telemetry.track({
        type: 'TOOL_RUN_DENIED',
        runId,
        toolId,
        reason: tierCheck.reason,
      });
      this.publishUpsell(runId, toolId, tierCheck.details ?? tierCheck.reason);
      return tierCheck;
    }

    const monthlyQuotaCheck = this.checkMonthlyQuota(
      toolId,
      definition.limits?.monthlyQuota,
      context.plan,
      context.usageThisMonthByTool?.[toolId] ?? 0,
    );
    if (monthlyQuotaCheck) {
      this.telemetry.track({
        type: 'TOOL_RUN_DENIED',
        runId,
        toolId,
        reason: monthlyQuotaCheck.reason,
      });
      this.publishUpsell(runId, toolId, monthlyQuotaCheck.details ?? monthlyQuotaCheck.reason);
      return monthlyQuotaCheck;
    }

    this.telemetry.track({
      type: 'ACCESS_CHECK_STAGE',
      runId,
      toolId,
      stage: 'CHECK_FILE_LIMITS_START',
    });
    const fileLimitsCheck = await this.checkFileLimits(inputIds, definition.limits, context.plan, runId, toolId);
    this.telemetry.track({
      type: 'ACCESS_CHECK_STAGE',
      runId,
      toolId,
      stage: 'CHECK_FILE_LIMITS_DONE',
    });
    if (fileLimitsCheck) {
      this.telemetry.track({
        type: 'TOOL_RUN_DENIED',
        runId,
        toolId,
        reason: fileLimitsCheck.reason,
      });
      this.publishUpsell(runId, toolId, fileLimitsCheck.details ?? fileLimitsCheck.reason);
      return fileLimitsCheck;
    }

    return null;
  }

  private checkEntitlements(required: string[] | undefined, actual: string[]): AccessDeniedResult | null {
    if (!required || required.length === 0) {
      return null;
    }
    const missing = required.filter((x) => !actual.includes(x));
    if (missing.length > 0) {
      return {
        type: 'TOOL_ACCESS_DENIED',
        reason: 'ENTITLEMENT_REQUIRED',
        details: `Missing entitlements: ${missing.join(', ')}`,
      };
    }
    return null;
  }

  private checkFeatureTier(
    required: 'basic' | 'pro' | undefined,
    actual: 'basic' | 'pro',
  ): AccessDeniedResult | null {
    if (!required) {
      return null;
    }
    if (required === 'pro' && actual !== 'pro') {
      return {
        type: 'TOOL_ACCESS_DENIED',
        reason: 'LIMIT_EXCEEDED',
        details: 'This tool requires PRO tier',
      };
    }
    return null;
  }

  private checkMonthlyQuota(
    toolId: string,
    monthlyQuota: { free: number; pro: number } | undefined,
    plan: 'basic' | 'pro',
    currentUsage: number,
  ): AccessDeniedResult | null {
    if (!monthlyQuota) {
      return null;
    }
    const quota = plan === 'pro' ? monthlyQuota.pro : monthlyQuota.free;
    if (currentUsage >= quota) {
      return {
        type: 'TOOL_ACCESS_DENIED',
        reason: 'LIMIT_EXCEEDED',
        details: `Monthly quota exceeded for ${toolId}`,
      };
    }
    return null;
  }

  private async checkFileLimits(
    fileIds: string[],
    limits:
      | {
        maxFileSize?: { free: number; pro: number };
        maxPagesPerFile?: { free: number; pro: number };
      }
      | undefined,
    plan: 'basic' | 'pro',
    runId: string,
    toolId: string,
  ): Promise<AccessDeniedResult | null> {
    if (!limits) {
      return null;
    }

    const maxFileSize = limits.maxFileSize ? (plan === 'pro' ? limits.maxFileSize.pro : limits.maxFileSize.free) : null;
    const maxPagesPerFile = limits.maxPagesPerFile
      ? (plan === 'pro' ? limits.maxPagesPerFile.pro : limits.maxPagesPerFile.free)
      : null;

    for (const fileId of fileIds) {
      if (maxFileSize !== null) {
        const startedAt = Date.now();
        this.telemetry.track({
          type: 'ACCESS_CHECK_STAGE',
          runId,
          toolId,
          fileId,
          stage: 'MAX_FILE_SIZE_READ_START',
        });
        const entry = await this.fileSystem.read(fileId);
        const size = await entry.getSize();
        this.telemetry.track({
          type: 'ACCESS_CHECK_STAGE',
          runId,
          toolId,
          fileId,
          stage: 'MAX_FILE_SIZE_READ_DONE',
          durationMs: Date.now() - startedAt,
        });
        if (size > maxFileSize) {
          return {
            type: 'TOOL_ACCESS_DENIED',
            reason: 'LIMIT_EXCEEDED',
            details: `File ${fileId} exceeds maxFileSize`,
          };
        }
      }

      if (maxPagesPerFile !== null) {
        this.telemetry.track({
          type: 'ACCESS_CHECK_STAGE',
          runId,
          toolId,
          fileId,
          stage: 'PAGE_COUNT_CHECK_START',
        });
        const pageCount = await this.getPdfPageCount(fileId, runId, toolId);
        this.telemetry.track({
          type: 'ACCESS_CHECK_STAGE',
          runId,
          toolId,
          fileId,
          stage: 'PAGE_COUNT_CHECK_DONE',
        });
        if (pageCount > maxPagesPerFile) {
          return {
            type: 'TOOL_ACCESS_DENIED',
            reason: 'LIMIT_EXCEEDED',
            details: `File ${fileId} exceeds maxPagesPerFile`,
          };
        }
      }
    }

    return null;
  }

  private async getPdfPageCount(fileId: string, runId: string, toolId: string): Promise<number> {
    const startedAt = Date.now();
    this.telemetry.track({
      type: 'ACCESS_CHECK_STAGE',
      runId,
      toolId,
      fileId,
      stage: 'READ_FILE_FOR_PAGE_COUNT_START',
    });
    const entry = await this.fileSystem.read(fileId);
    this.telemetry.track({
      type: 'ACCESS_CHECK_STAGE',
      runId,
      toolId,
      fileId,
      stage: 'READ_FILE_FOR_PAGE_COUNT_DONE',
      durationMs: Date.now() - startedAt,
    });
    const mimeType = await entry.getType();
    if (mimeType !== 'application/pdf') {
      this.telemetry.track({
        type: 'PAGE_COUNT_CHECK_RESULT',
        runId,
        toolId,
        fileId,
        pageCount: 1,
        durationMs: Date.now() - startedAt,
      });
      return 1;
    }
    this.telemetry.track({
      type: 'ACCESS_CHECK_STAGE',
      runId,
      toolId,
      fileId,
      stage: 'READ_BLOB_FOR_PAGE_COUNT_START',
    });
    const blob = await entry.getBlob();
    const bytes = new Uint8Array(await blob.arrayBuffer());
    this.telemetry.track({
      type: 'ACCESS_CHECK_STAGE',
      runId,
      toolId,
      fileId,
      stage: 'READ_BLOB_FOR_PAGE_COUNT_DONE',
      durationMs: Date.now() - startedAt,
    });
    const command: IWorkerCommand = {
      id: crypto.randomUUID(),
      type: 'COMMAND',
      payload: { type: 'GET_PDF_PAGE_COUNT', payload: { fileId, bytes, mimeType } },
    };

    let event: IWorkerEvent;
    const timeoutMs = this.pageCountChecksPerformed === 0 ? this.firstPageCountTimeoutMs : this.pageCountTimeoutMs;
    this.telemetry.track({
      type: 'ACCESS_CHECK_STAGE',
      runId,
      toolId,
      fileId,
      stage: 'PAGE_COUNT_DISPATCH_START',
    });
    try {
      event = await Promise.race<IWorkerEvent>([
        this.workerOrchestrator.dispatch(command, (workerEvent) => {
          if (workerEvent.payload.type === 'DIAGNOSTIC' && workerEvent.payload.payload.channel === 'PAGE_COUNT') {
            this.telemetry.track({
              type: 'PAGE_COUNT_WORKER_STAGE',
              runId,
              toolId,
              fileId,
              stage: workerEvent.payload.payload.stage,
              durationMs: workerEvent.payload.payload.durationMs,
              note: workerEvent.payload.payload.note,
            });
          }
        }),
        new Promise<IWorkerEvent>((_, reject) => {
          setTimeout(() => {
            reject(this.createCodedError('PAGE_COUNT_CHECK_TIMEOUT', 'Page-count precheck timed out'));
          }, timeoutMs);
        }),
      ]);
    } catch (error) {
      const typed = error as { code?: unknown; message?: unknown };
      const code = typeof typed.code === 'string' ? typed.code : 'PAGE_COUNT_QUERY_FAILED';
      const message = error instanceof Error ? error.message : 'Page-count precheck failed';
      const canFallbackToMainThread = this.canFallbackToMainThread(code, timeoutMs);
      if (canFallbackToMainThread) {
        this.telemetry.track({
          type: 'ACCESS_CHECK_STAGE',
          runId,
          toolId,
          fileId,
          stage: 'PAGE_COUNT_MAIN_THREAD_FALLBACK_START',
        });
        try {
          const pageCount = await getPdfPageCountFromBytes(bytes, mimeType);
          this.telemetry.track({
            type: 'ACCESS_CHECK_STAGE',
            runId,
            toolId,
            fileId,
            stage: 'PAGE_COUNT_MAIN_THREAD_FALLBACK_DONE',
            durationMs: Date.now() - startedAt,
          });
          this.telemetry.track({
            type: 'PAGE_COUNT_CHECK_RESULT',
            runId,
            toolId,
            fileId,
            pageCount,
            durationMs: Date.now() - startedAt,
          });
          return pageCount;
        } catch (fallbackError) {
          const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : 'Main-thread fallback failed';
          this.telemetry.track({
            type: 'ACCESS_CHECK_STAGE',
            runId,
            toolId,
            fileId,
            stage: 'PAGE_COUNT_MAIN_THREAD_FALLBACK_FAILED',
            durationMs: Date.now() - startedAt,
          });
          this.telemetry.track({
            type: 'PAGE_COUNT_CHECK_ERROR',
            runId,
            toolId,
            fileId,
            code: 'PAGE_COUNT_MAIN_THREAD_FALLBACK_FAILED',
            message: fallbackMessage,
            durationMs: Date.now() - startedAt,
          });
          throw this.createCodedError('PAGE_COUNT_MAIN_THREAD_FALLBACK_FAILED', fallbackMessage);
        }
      }
      this.telemetry.track({
        type: 'PAGE_COUNT_CHECK_ERROR',
        runId,
        toolId,
        fileId,
        code,
        message,
        durationMs: Date.now() - startedAt,
      });
      throw this.createCodedError(code, message);
    } finally {
      this.pageCountChecksPerformed += 1;
    }
    if (event.payload.type === 'PAGE_COUNT_RESULT') {
      this.telemetry.track({
        type: 'PAGE_COUNT_CHECK_RESULT',
        runId,
        toolId,
        fileId,
        pageCount: event.payload.payload.pageCount,
        durationMs: Date.now() - startedAt,
      });
      return event.payload.payload.pageCount;
    }
    if (event.payload.type === 'ERROR') {
      const code = event.payload.payload.code ?? 'PAGE_COUNT_QUERY_FAILED';
      const canFallbackToMainThread = this.canFallbackToMainThread(code, timeoutMs);
      if (canFallbackToMainThread) {
        this.telemetry.track({
          type: 'ACCESS_CHECK_STAGE',
          runId,
          toolId,
          fileId,
          stage: 'PAGE_COUNT_MAIN_THREAD_FALLBACK_START',
        });
        try {
          const pageCount = await getPdfPageCountFromBytes(bytes, mimeType);
          this.telemetry.track({
            type: 'ACCESS_CHECK_STAGE',
            runId,
            toolId,
            fileId,
            stage: 'PAGE_COUNT_MAIN_THREAD_FALLBACK_DONE',
            durationMs: Date.now() - startedAt,
          });
          this.telemetry.track({
            type: 'PAGE_COUNT_CHECK_RESULT',
            runId,
            toolId,
            fileId,
            pageCount,
            durationMs: Date.now() - startedAt,
          });
          return pageCount;
        } catch (fallbackError) {
          const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : 'Main-thread fallback failed';
          this.telemetry.track({
            type: 'ACCESS_CHECK_STAGE',
            runId,
            toolId,
            fileId,
            stage: 'PAGE_COUNT_MAIN_THREAD_FALLBACK_FAILED',
            durationMs: Date.now() - startedAt,
          });
          this.telemetry.track({
            type: 'PAGE_COUNT_CHECK_ERROR',
            runId,
            toolId,
            fileId,
            code: 'PAGE_COUNT_MAIN_THREAD_FALLBACK_FAILED',
            message: fallbackMessage,
            durationMs: Date.now() - startedAt,
          });
          throw this.createCodedError('PAGE_COUNT_MAIN_THREAD_FALLBACK_FAILED', fallbackMessage);
        }
      }
      this.telemetry.track({
        type: 'PAGE_COUNT_CHECK_ERROR',
        runId,
        toolId,
        fileId,
        code,
        message: event.payload.payload.message,
        durationMs: Date.now() - startedAt,
      });
      throw this.createCodedError(code, `${code}: ${event.payload.payload.message}`);
    }
    this.telemetry.track({
      type: 'PAGE_COUNT_CHECK_ERROR',
      runId,
      toolId,
      fileId,
      code: 'PAGE_COUNT_QUERY_INVALID_EVENT',
      message: `Unexpected worker event type: ${event.payload.type}`,
      durationMs: Date.now() - startedAt,
    });
    throw this.createCodedError('PAGE_COUNT_QUERY_INVALID_EVENT', `PAGE_COUNT_QUERY_INVALID_EVENT: ${event.payload.type}`);
  }

  private createCodedError(code: string, message: string): Error & { code: string } {
    const error = new Error(message) as Error & { code: string };
    error.code = code;
    return error;
  }

  private canFallbackToMainThread(code: string, timeoutMs: number): boolean {
    if (this.pageCountFallbackMode === 'off') {
      return false;
    }
    if (this.pageCountFallbackMode === 'on') {
      return timeoutMs >= 1_000;
    }
    return timeoutMs >= 1_000 && (code === 'WORKER_TIMEOUT' || code === 'WORKER_CRASH');
  }
}
