import type { IWorkerCommand, IWorkerEvent } from '../types/contracts';

export interface WorkerOrchestrator {
  dispatch(command: IWorkerCommand, onEvent?: (event: IWorkerEvent) => void, signal?: AbortSignal): Promise<IWorkerEvent>;
}

export interface WorkerLike {
  onmessage: ((event: { data: IWorkerEvent }) => void) | null;
  onerror: ((event: { message?: string }) => void) | null;
  postMessage: (command: IWorkerCommand) => void;
  terminate: () => void;
}

export class WebWorkerOrchestrator implements WorkerOrchestrator {
  private worker: WorkerLike | null = null;
  private readonly inFlight = new Map<
    string,
    {
      resolve: (event: IWorkerEvent) => void;
      onEvent?: (event: IWorkerEvent) => void;
      timeoutId: ReturnType<typeof setTimeout>;
      signal?: AbortSignal;
      onAbort: () => void;
    }
  >();

  constructor(
    private readonly createWorker: () => WorkerLike,
    private readonly timeoutMs = 120_000,
  ) {}

  private ensureWorker(): WorkerLike {
    if (this.worker) {
      return this.worker;
    }
    const worker = this.createWorker();
    worker.onmessage = (event) => {
      const payload = event.data;
      const pending = this.inFlight.get(payload.id);
      if (!pending) {
        return;
      }
      pending.onEvent?.(payload);
      if (
        payload.payload.type === 'RESULT'
        || payload.payload.type === 'PAGE_COUNT_RESULT'
        || payload.payload.type === 'TEXT_LAYER_RESULT'
        || payload.payload.type === 'IMAGE_CANDIDATES_RESULT'
        || payload.payload.type === 'STUDIO_TEXT_EDITS_APPLIED'
        || payload.payload.type === 'ERROR'
      ) {
        this.settle(payload.id, payload);
      }
    };
    worker.onerror = (event) => {
      const pendingIds = Array.from(this.inFlight.keys());
      for (const id of pendingIds) {
        this.settle(id, {
          id,
          type: 'EVENT',
          payload: {
            type: 'ERROR',
            payload: { message: event.message ?? 'Worker crashed', code: 'WORKER_CRASH' },
          },
        });
      }
      worker.terminate();
      this.worker = null;
    };
    this.worker = worker;
    return worker;
  }

  private settle(commandId: string, event: IWorkerEvent): void {
    const pending = this.inFlight.get(commandId);
    if (!pending) {
      return;
    }
    this.inFlight.delete(commandId);
    clearTimeout(pending.timeoutId);
    pending.signal?.removeEventListener('abort', pending.onAbort);
    pending.resolve(event);
  }

  terminateForTest(): void {
    const pendingIds = Array.from(this.inFlight.keys());
    for (const id of pendingIds) {
      this.settle(id, {
        id,
        type: 'EVENT',
        payload: {
          type: 'ERROR',
          payload: { message: 'Worker terminated for test', code: 'WORKER_CRASH' },
        },
      });
    }
    this.worker?.terminate();
    this.worker = null;
  }

  dispatch(command: IWorkerCommand, onEvent?: (event: IWorkerEvent) => void, signal?: AbortSignal): Promise<IWorkerEvent> {
    if (signal?.aborted) {
      return Promise.resolve({
        id: command.id,
        type: 'EVENT',
        payload: { type: 'ERROR', payload: { message: 'Worker execution aborted', code: 'WORKER_ABORTED' } },
      });
    }

    const worker = this.ensureWorker();
    return new Promise<IWorkerEvent>((resolve) => {
      const onAbort = (): void => {
        this.settle(command.id, {
          id: command.id,
          type: 'EVENT',
          payload: { type: 'ERROR', payload: { message: 'Worker execution aborted', code: 'WORKER_ABORTED' } },
        });
      };
      const timeoutId = setTimeout(() => {
        this.settle(command.id, {
          id: command.id,
          type: 'EVENT',
          payload: { type: 'ERROR', payload: { message: 'Worker timeout exceeded', code: 'WORKER_TIMEOUT' } },
        });
      }, this.timeoutMs);
      this.inFlight.set(command.id, { resolve, onEvent, timeoutId, signal, onAbort });
      signal?.addEventListener('abort', onAbort, { once: true });

      if (!this.inFlight.has(command.id)) {
        return;
      }

      worker.postMessage(command);
    });
  }
}

export class InProcessWorkerOrchestrator implements WorkerOrchestrator {
  constructor(
    private readonly handler: (command: IWorkerCommand) => Promise<IWorkerEvent> = async (command) => ({
      id: command.id,
      type: 'EVENT',
      payload: { type: 'ERROR', payload: { message: 'Worker handler not configured', code: 'NOT_IMPLEMENTED' } },
    }),
  ) {}

  async dispatch(command: IWorkerCommand, onEvent?: (event: IWorkerEvent) => void, signal?: AbortSignal): Promise<IWorkerEvent> {
    if (signal?.aborted) {
      return {
        id: command.id,
        type: 'EVENT',
        payload: { type: 'ERROR', payload: { message: 'Worker execution aborted', code: 'WORKER_ABORTED' } },
      };
    }
    const event = await this.handler(command);
    onEvent?.(event);
    return event;
  }
}

export function createBrowserWorkerOrchestrator(timeoutMs?: number): WebWorkerOrchestrator {
  return new WebWorkerOrchestrator(
    () =>
      new Worker(new URL('./worker-entrypoint.ts', import.meta.url), {
        type: 'module',
      }) as unknown as WorkerLike,
    timeoutMs,
  );
}
