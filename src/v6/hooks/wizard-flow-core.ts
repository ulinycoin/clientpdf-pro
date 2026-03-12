import type { PlatformRuntime } from '../../app/platform/create-platform';
import type { IWorkerCommand, ToolRunContext } from '../../core/public/contracts';
import { isVfsQuotaExceededError } from '../../app/platform/error-utils';
import type { LimitService, WizardState } from '../components/Wizard/types';

export const INITIAL_WIZARD_STATE: WizardState = {
  step: 'upload',
  fileIds: [],
  outputIds: [],
  progress: 0,
  isValidating: false,
  isProcessing: false,
  error: null,
  toast: null,
  upsellReason: null,
};

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return fallback;
}

function isQuotaExceededError(error: unknown): boolean {
  return isVfsQuotaExceededError(error);
}

async function deleteMany(fileIds: string[], removeById: (fileId: string) => Promise<void>): Promise<void> {
  await Promise.all(fileIds.map(async (fileId) => removeById(fileId)));
}

export interface WizardFlowCoreDeps {
  runtime: PlatformRuntime;
  toolId: string;
  context: ToolRunContext;
  limitService: LimitService;
  onToast?: (message: string) => void;
}

export class WizardFlowCore {
  private state: WizardState = { ...INITIAL_WIZARD_STATE };
  private abortController: AbortController | null = null;

  constructor(private readonly deps: WizardFlowCoreDeps) {}

  getState(): WizardState {
    return this.state;
  }

  dismissToast(): WizardState {
    this.state = { ...this.state, toast: null };
    return this.state;
  }

  dismissUpsell(): WizardState {
    this.state = { ...this.state, upsellReason: null };
    return this.state;
  }

  cancelProcessing(): void {
    this.abortController?.abort();
  }

  async resetFlow(deleteInputs = true): Promise<WizardState> {
    this.abortController?.abort();
    this.abortController = null;

    if (deleteInputs && this.state.fileIds.length > 0) {
      await deleteMany(this.state.fileIds, async (fileId) => {
        await this.deps.runtime.vfs.delete(fileId);
      });
    }

    this.state = { ...INITIAL_WIZARD_STATE };
    return this.state;
  }

  async handleFilesAdded(files: File[]): Promise<WizardState> {
    if (files.length === 0) {
      return this.state;
    }

    this.state = {
      ...this.state,
      isValidating: true,
      error: null,
      toast: null,
      upsellReason: null,
    };

    const writtenFileIds: string[] = [];
    try {
      for (const file of files) {
        const entry = await this.deps.runtime.vfs.write(file);
        writtenFileIds.push(entry.id);
      }
    } catch (error) {
      if (writtenFileIds.length > 0) {
        await deleteMany(writtenFileIds, async (fileId) => {
          await this.deps.runtime.vfs.delete(fileId);
        });
      }

      if (isQuotaExceededError(error)) {
        const message = 'Storage quota exceeded. Free some space and retry.';
        this.deps.onToast?.(message);
        this.state = {
          ...this.state,
          step: 'upload',
          isValidating: false,
          toast: message,
        };
        return this.state;
      }

      this.state = {
        ...this.state,
        step: 'upload',
        isValidating: false,
        error: toErrorMessage(error, 'Failed to upload files'),
      };
      return this.state;
    }

    try {
      const toolDef = this.deps.runtime.registry.get(this.deps.toolId);
      const access = await this.deps.limitService.check({
        runtime: this.deps.runtime,
        toolId: this.deps.toolId,
        toolLimits: toolDef.limits,
        fileIds: writtenFileIds,
        context: this.deps.context,
      });

      if (!access.allowed) {
        await deleteMany(writtenFileIds, async (fileId) => {
          await this.deps.runtime.vfs.delete(fileId);
        });

        this.state = {
          ...this.state,
          step: 'upload',
          fileIds: [],
          isValidating: false,
          upsellReason: access.reason ?? 'Plan limit reached',
        };
        return this.state;
      }

      this.state = {
        ...this.state,
        step: 'config',
        fileIds: writtenFileIds,
        outputIds: [],
        progress: 0,
        isValidating: false,
        error: null,
      };
      return this.state;
    } catch (error) {
      await deleteMany(writtenFileIds, async (fileId) => {
        await this.deps.runtime.vfs.delete(fileId);
      });

      this.state = {
        ...this.state,
        step: 'upload',
        fileIds: [],
        isValidating: false,
        error: toErrorMessage(error, 'Validation failed'),
      };
      return this.state;
    }
  }

  async hydrateFromFileIds(fileIds: string[]): Promise<WizardState> {
    const sanitizedIds = Array.from(new Set(fileIds.filter((id): id is string => typeof id === 'string' && id.length > 0)));
    if (sanitizedIds.length === 0) {
      return this.state;
    }

    if (
      this.state.fileIds.length === sanitizedIds.length
      && this.state.fileIds.every((id, index) => id === sanitizedIds[index])
      && this.state.step !== 'upload'
    ) {
      return this.state;
    }

    this.state = {
      ...this.state,
      isValidating: true,
      error: null,
      toast: null,
      upsellReason: null,
    };

    try {
      await Promise.all(sanitizedIds.map(async (fileId) => this.deps.runtime.vfs.read(fileId)));

      const toolDef = this.deps.runtime.registry.get(this.deps.toolId);
      const access = await this.deps.limitService.check({
        runtime: this.deps.runtime,
        toolId: this.deps.toolId,
        toolLimits: toolDef.limits,
        fileIds: sanitizedIds,
        context: this.deps.context,
      });

      if (!access.allowed) {
        this.state = {
          ...this.state,
          step: 'upload',
          fileIds: [],
          outputIds: [],
          progress: 0,
          isValidating: false,
          upsellReason: access.reason ?? 'Plan limit reached',
        };
        return this.state;
      }

      this.state = {
        ...this.state,
        step: 'config',
        fileIds: sanitizedIds,
        outputIds: [],
        progress: 0,
        isValidating: false,
        isProcessing: false,
        error: null,
      };
      return this.state;
    } catch (error) {
      this.state = {
        ...this.state,
        step: 'upload',
        fileIds: [],
        outputIds: [],
        progress: 0,
        isValidating: false,
        error: toErrorMessage(error, 'Failed to open selected files'),
      };
      return this.state;
    }
  }

  async startProcessing(optionsPayload?: Record<string, unknown>): Promise<WizardState> {
    if (this.state.fileIds.length === 0) {
      this.state = { ...this.state, step: 'upload', error: 'No files selected' };
      return this.state;
    }

    const overrideInputIds = Array.isArray(optionsPayload?.inputIds)
      ? optionsPayload.inputIds.filter((value): value is string => typeof value === 'string')
      : null;
    const effectiveInputIds = overrideInputIds && overrideInputIds.length > 0 ? overrideInputIds : this.state.fileIds;

    const controller = new AbortController();
    this.abortController = controller;

    this.state = {
      ...this.state,
      step: 'processing',
      progress: 0,
      isProcessing: true,
      error: null,
    };

    const command: IWorkerCommand = {
      id: crypto.randomUUID(),
      type: 'COMMAND',
      payload: {
        type: 'PROCESS_TOOL',
        payload: {
          toolId: this.deps.toolId,
          inputIds: effectiveInputIds,
          options: optionsPayload,
        },
      },
    };

    const finalEvent = await this.deps.runtime.workerOrchestrator.dispatch(
      command,
      (event) => {
        if (controller.signal.aborted) {
          return;
        }
        const payload = event.payload;
        if (payload.type === 'PROGRESS') {
          this.state = { ...this.state, progress: payload.payload.progress };
        }
      },
      controller.signal,
    );

    const payload = finalEvent.payload;
    if (controller.signal.aborted || (payload.type === 'ERROR' && payload.payload.code === 'WORKER_ABORTED')) {
      this.state = {
        ...this.state,
        step: 'config',
        isProcessing: false,
        progress: 0,
        error: 'Processing canceled',
      };
      return this.state;
    }

    if (payload.type === 'ERROR') {
      this.state = {
        ...this.state,
        step: 'config',
        isProcessing: false,
        progress: 0,
        error: payload.payload.message,
      };
      return this.state;
    }

    if (payload.type !== 'RESULT') {
      this.state = {
        ...this.state,
        step: 'config',
        isProcessing: false,
        progress: 0,
        error: 'Unexpected worker event',
      };
      return this.state;
    }

    this.state = {
      ...this.state,
      step: 'result',
      outputIds: payload.payload.outputIds,
      isProcessing: false,
      progress: 100,
      error: null,
    };
    return this.state;
  }
}
