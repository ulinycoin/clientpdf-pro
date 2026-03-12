import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalRegistry } from '../registry/global-registry';
import type { RunnerTelemetryEvent, TelemetrySink } from '../telemetry/telemetry';
import type { IFileEntry, IFileSystem, IToolDefinition, IWorkerCommand, IWorkerEvent } from '../types/contracts';
import { UnifiedToolRunner } from './unified-tool-runner';

class InMemoryFileEntry implements IFileEntry {
  constructor(readonly id: string, private readonly blob: Blob) {}

  getBlob(): Promise<Blob> {
    return Promise.resolve(this.blob);
  }

  getText(): Promise<string> {
    return this.blob.text();
  }

  getName(): string {
    return this.id;
  }

  getSize(): Promise<number> {
    return Promise.resolve(this.blob.size);
  }

  getType(): Promise<string> {
    return Promise.resolve(this.blob.type);
  }
}

class InMemoryFileSystem implements IFileSystem {
  private readonly map = new Map<string, Blob>();

  seed(id: string, blob: Blob): void {
    this.map.set(id, blob);
  }

  async write(data: Blob): Promise<IFileEntry> {
    const id = crypto.randomUUID();
    this.map.set(id, data);
    return new InMemoryFileEntry(id, data);
  }

  async read(id: string): Promise<IFileEntry> {
    const blob = this.map.get(id);
    if (!blob) {
      throw new Error(`Missing file: ${id}`);
    }
    return new InMemoryFileEntry(id, blob);
  }

  async delete(id: string): Promise<void> {
    this.map.delete(id);
  }
}

const tool: IToolDefinition = {
  id: 'merge-pdf',
  name: 'Merge PDF',
  description: 'merge',
  entitlements: ['pdf.merge'],
  limits: {
    featureTier: 'basic',
    maxFileSize: { free: 2, pro: 10 },
    monthlyQuota: { free: 1, pro: 100 },
  },
  uiLoader: async () => ({ default: () => null }),
  logicLoader: async () => ({ run: async ({ inputIds }) => ({ outputIds: inputIds }) }),
};

test('UnifiedToolRunner returns TOOL_ACCESS_DENIED when entitlement is missing', async () => {
  const registry = new GlobalRegistry();
  registry.register(tool);

  const fs = new InMemoryFileSystem();
  fs.seed('f1', new Blob([new Uint8Array([1])]));

  const runner = new UnifiedToolRunner(
    registry,
    {
      dispatch: async (command: IWorkerCommand): Promise<IWorkerEvent> => ({
        id: command.id,
        type: 'EVENT',
        payload: { type: 'RESULT', payload: { outputIds: ['out'] } },
      }),
    },
    fs,
  );

  const result = await runner.execute(
    'merge-pdf',
    { inputIds: ['f1'] },
    { userId: 'u1', plan: 'basic', entitlements: [] },
  );

  assert.equal(result.type, 'TOOL_ACCESS_DENIED');
  assert.equal(result.reason, 'ENTITLEMENT_REQUIRED');
});

test('UnifiedToolRunner returns TOOL_ACCESS_DENIED when maxFileSize is exceeded', async () => {
  const registry = new GlobalRegistry();
  registry.register(tool);

  const fs = new InMemoryFileSystem();
  fs.seed('f1', new Blob([new Uint8Array([1, 2, 3])]));

  const runner = new UnifiedToolRunner(
    registry,
    {
      dispatch: async (command: IWorkerCommand): Promise<IWorkerEvent> => ({
        id: command.id,
        type: 'EVENT',
        payload: { type: 'RESULT', payload: { outputIds: ['out'] } },
      }),
    },
    fs,
  );

  const result = await runner.execute(
    'merge-pdf',
    { inputIds: ['f1'] },
    { userId: 'u1', plan: 'basic', entitlements: ['pdf.merge'] },
  );

  assert.equal(result.type, 'TOOL_ACCESS_DENIED');
  assert.equal(result.reason, 'LIMIT_EXCEEDED');
});

test('UnifiedToolRunner dispatches worker and returns TOOL_RESULT', async () => {
  const registry = new GlobalRegistry();
  registry.register(tool);

  const fs = new InMemoryFileSystem();
  fs.seed('f1', new Blob([new Uint8Array([1, 2])]));

  const runner = new UnifiedToolRunner(
    registry,
    {
      dispatch: async (command: IWorkerCommand): Promise<IWorkerEvent> => ({
        id: command.id,
        type: 'EVENT',
        payload: { type: 'RESULT', payload: { outputIds: ['out-1'] } },
      }),
    },
    fs,
  );

  const result = await runner.execute(
    'merge-pdf',
    { inputIds: ['f1'] },
    { userId: 'u1', plan: 'basic', entitlements: ['pdf.merge'] },
  );

  assert.deepEqual(result, { type: 'TOOL_RESULT', outputIds: ['out-1'] });
});

test('UnifiedToolRunner forwards PROGRESS events', async () => {
  const registry = new GlobalRegistry();
  registry.register(tool);

  const fs = new InMemoryFileSystem();
  fs.seed('f1', new Blob([new Uint8Array([1, 2])]));

  const runner = new UnifiedToolRunner(
    registry,
    {
      dispatch: async (command: IWorkerCommand, onEvent): Promise<IWorkerEvent> => {
        onEvent?.({
          id: command.id,
          type: 'EVENT',
          payload: { type: 'PROGRESS', payload: { progress: 42 } },
        });
        return {
          id: command.id,
          type: 'EVENT',
          payload: { type: 'RESULT', payload: { outputIds: ['out-progress'] } },
        };
      },
    },
    fs,
  );

  let progressSeen = 0;
  const result = await runner.execute(
    'merge-pdf',
    { inputIds: ['f1'] },
    { userId: 'u1', plan: 'basic', entitlements: ['pdf.merge'] },
    (event) => {
      progressSeen = event.progress;
    },
  );

  assert.equal(progressSeen, 42);
  assert.deepEqual(result, { type: 'TOOL_RESULT', outputIds: ['out-progress'] });
});

test('UnifiedToolRunner emits telemetry events for denied and successful execution', async () => {
  const registry = new GlobalRegistry();
  registry.register(tool);
  const fs = new InMemoryFileSystem();
  fs.seed('f1', new Blob([new Uint8Array([1, 2])]));

  const events: RunnerTelemetryEvent[] = [];
  const sink: TelemetrySink = { track: (event) => events.push(event) };

  const deniedRunner = new UnifiedToolRunner(
    registry,
    {
      dispatch: async (command: IWorkerCommand): Promise<IWorkerEvent> => ({
        id: command.id,
        type: 'EVENT',
        payload: { type: 'RESULT', payload: { outputIds: ['unused'] } },
      }),
    },
    fs,
    sink,
  );

  const denied = await deniedRunner.execute('merge-pdf', { inputIds: ['f1'] }, { userId: 'u1', plan: 'basic', entitlements: [] });
  assert.equal(denied.type, 'TOOL_ACCESS_DENIED');
  assert.ok(events.some((e) => e.type === 'TOOL_RUN_DENIED'));
  const deniedEvent = events.find((e) => e.type === 'TOOL_RUN_DENIED');
  const deniedUpsell = events.find((e) => e.type === 'UI_UPSELL_SHOWN');
  assert.ok(deniedEvent);
  assert.ok(deniedUpsell);
  assert.equal(deniedEvent?.runId, deniedUpsell?.runId);

  events.length = 0;
  const successRunner = new UnifiedToolRunner(
    registry,
    {
      dispatch: async (command: IWorkerCommand, onEvent): Promise<IWorkerEvent> => {
        onEvent?.({
          id: command.id,
          type: 'EVENT',
          payload: { type: 'PROGRESS', payload: { progress: 50 } },
        });
        return {
          id: command.id,
          type: 'EVENT',
          payload: { type: 'RESULT', payload: { outputIds: ['o1'] } },
        };
      },
    },
    fs,
    sink,
  );

  const success = await successRunner.execute(
    'merge-pdf',
    { inputIds: ['f1'] },
    { userId: 'u1', plan: 'basic', entitlements: ['pdf.merge'] },
  );
  assert.equal(success.type, 'TOOL_RESULT');
  assert.ok(events.some((e) => e.type === 'TOOL_RUN_STARTED'));
  assert.ok(events.some((e) => e.type === 'TOOL_RUN_PROGRESS'));
  assert.ok(events.some((e) => e.type === 'TOOL_RUN_RESULT'));
});

test('UnifiedToolRunner emits UI_TOAST_SHOWN for worker error and dispatch failures', async () => {
  const registry = new GlobalRegistry();
  registry.register(tool);
  const fs = new InMemoryFileSystem();
  fs.seed('f1', new Blob([new Uint8Array([1, 2])]));
  const events: RunnerTelemetryEvent[] = [];
  const sink: TelemetrySink = { track: (event) => events.push(event) };

  const errorRunner = new UnifiedToolRunner(
    registry,
    {
      dispatch: async (command: IWorkerCommand): Promise<IWorkerEvent> => ({
        id: command.id,
        type: 'EVENT',
        payload: { type: 'ERROR', payload: { code: 'TOOL_ERROR', message: 'Broken PDF structure' } },
      }),
    },
    fs,
    sink,
  );

  const errorResult = await errorRunner.execute(
    'merge-pdf',
    { inputIds: ['f1'] },
    { userId: 'u1', plan: 'basic', entitlements: ['pdf.merge'] },
  );
  assert.equal(errorResult.type, 'TOOL_ERROR');
  assert.ok(events.some((e) => e.type === 'UI_TOAST_SHOWN' && e.message === 'Broken PDF structure'));

  events.length = 0;
  const throwRunner = new UnifiedToolRunner(
    registry,
    {
      dispatch: async () => {
        throw new Error('Worker transport crashed');
      },
    },
    fs,
    sink,
  );

  const throwResult = await throwRunner.execute(
    'merge-pdf',
    { inputIds: ['f1'] },
    { userId: 'u1', plan: 'basic', entitlements: ['pdf.merge'] },
  );
  assert.equal(throwResult.type, 'TOOL_ERROR');
  assert.equal(throwResult.code, 'WORKER_DISPATCH_FAILED');
  assert.ok(events.some((e) => e.type === 'UI_TOAST_SHOWN' && e.message === 'Worker transport crashed'));
});

test('UnifiedToolRunner checks maxPagesPerFile via worker command', async () => {
  const registry = new GlobalRegistry();
  registry.register({
    ...tool,
    limits: {
      ...tool.limits,
      maxPagesPerFile: { free: 1, pro: 10 },
    },
  });
  const fs = new InMemoryFileSystem();
  fs.seed('f1', new Blob([new Uint8Array([1])], { type: 'application/pdf' }));

  const runner = new UnifiedToolRunner(
    registry,
    {
      dispatch: async (command: IWorkerCommand): Promise<IWorkerEvent> => {
        if (command.payload.type === 'GET_PDF_PAGE_COUNT') {
          return {
            id: command.id,
            type: 'EVENT',
            payload: { type: 'PAGE_COUNT_RESULT', payload: { fileId: 'f1', pageCount: 2 } },
          };
        }
        return {
          id: command.id,
          type: 'EVENT',
          payload: { type: 'RESULT', payload: { outputIds: ['out'] } },
        };
      },
    },
    fs,
  );

  const result = await runner.execute(
    'merge-pdf',
    { inputIds: ['f1'] },
    { userId: 'u1', plan: 'basic', entitlements: ['pdf.merge'] },
  );

  assert.equal(result.type, 'TOOL_ACCESS_DENIED');
  if (result.type === 'TOOL_ACCESS_DENIED') {
    assert.equal(result.reason, 'LIMIT_EXCEEDED');
    assert.match(result.details ?? '', /maxPagesPerFile/);
  }
});

test('UnifiedToolRunner returns TOOL_ERROR when page-count query fails', async () => {
  const registry = new GlobalRegistry();
  registry.register({
    ...tool,
    limits: {
      ...tool.limits,
      maxPagesPerFile: { free: 1, pro: 10 },
    },
  });
  const fs = new InMemoryFileSystem();
  fs.seed('f1', new Blob([new Uint8Array([1])], { type: 'application/pdf' }));
  const events: RunnerTelemetryEvent[] = [];
  const sink: TelemetrySink = { track: (event) => events.push(event) };

  const runner = new UnifiedToolRunner(
    registry,
    {
      dispatch: async (command: IWorkerCommand): Promise<IWorkerEvent> => {
        if (command.payload.type === 'GET_PDF_PAGE_COUNT') {
          return {
            id: command.id,
            type: 'EVENT',
            payload: {
              type: 'ERROR',
              payload: { code: 'PDF_METADATA_UNAVAILABLE', message: 'Failed to parse page count' },
            },
          };
        }
        return {
          id: command.id,
          type: 'EVENT',
          payload: { type: 'RESULT', payload: { outputIds: ['out'] } },
        };
      },
    },
    fs,
    sink,
  );

  const result = await runner.execute(
    'merge-pdf',
    { inputIds: ['f1'] },
    { userId: 'u1', plan: 'basic', entitlements: ['pdf.merge'] },
  );

  assert.equal(result.type, 'TOOL_ERROR');
  if (result.type === 'TOOL_ERROR') {
    assert.equal(result.code, 'PDF_METADATA_UNAVAILABLE');
    assert.match(result.message, /PDF_METADATA_UNAVAILABLE/);
  }
  assert.ok(events.some((event) => event.type === 'UI_TOAST_SHOWN'));
  assert.ok(events.some((event) => event.type === 'PAGE_COUNT_CHECK_ERROR'));
});

test('UnifiedToolRunner emits PAGE_COUNT_CHECK_RESULT telemetry on successful metadata check', async () => {
  const registry = new GlobalRegistry();
  registry.register({
    ...tool,
    limits: {
      ...tool.limits,
      maxPagesPerFile: { free: 10, pro: 10 },
    },
  });
  const fs = new InMemoryFileSystem();
  fs.seed('f1', new Blob([new Uint8Array([1])], { type: 'application/pdf' }));
  const events: RunnerTelemetryEvent[] = [];
  const sink: TelemetrySink = { track: (event) => events.push(event) };

  const runner = new UnifiedToolRunner(
    registry,
    {
      dispatch: async (command: IWorkerCommand): Promise<IWorkerEvent> => {
        if (command.payload.type === 'GET_PDF_PAGE_COUNT') {
          return {
            id: command.id,
            type: 'EVENT',
            payload: { type: 'PAGE_COUNT_RESULT', payload: { fileId: 'f1', pageCount: 2 } },
          };
        }
        return {
          id: command.id,
          type: 'EVENT',
          payload: { type: 'RESULT', payload: { outputIds: ['out'] } },
        };
      },
    },
    fs,
    sink,
  );

  const result = await runner.execute(
    'merge-pdf',
    { inputIds: ['f1'] },
    { userId: 'u1', plan: 'basic', entitlements: ['pdf.merge'] },
  );

  assert.equal(result.type, 'TOOL_RESULT');
  assert.ok(events.some((event) => event.type === 'PAGE_COUNT_CHECK_RESULT'));
});

test('UnifiedToolRunner forwards worker DIAGNOSTIC page-count stages to telemetry', async () => {
  const registry = new GlobalRegistry();
  registry.register({
    ...tool,
    limits: {
      ...tool.limits,
      maxPagesPerFile: { free: 10, pro: 10 },
    },
  });
  const fs = new InMemoryFileSystem();
  fs.seed('f1', new Blob([new Uint8Array([1])], { type: 'application/pdf' }));
  const events: RunnerTelemetryEvent[] = [];
  const sink: TelemetrySink = { track: (event) => events.push(event) };

  const runner = new UnifiedToolRunner(
    registry,
    {
      dispatch: async (command: IWorkerCommand, onEvent): Promise<IWorkerEvent> => {
        if (command.payload.type === 'GET_PDF_PAGE_COUNT') {
          onEvent?.({
            id: command.id,
            type: 'EVENT',
            payload: {
              type: 'DIAGNOSTIC',
              payload: {
                channel: 'PAGE_COUNT',
                stage: 'WORKER_PARSE_START',
                fileId: 'f1',
              },
            },
          });
          return {
            id: command.id,
            type: 'EVENT',
            payload: { type: 'PAGE_COUNT_RESULT', payload: { fileId: 'f1', pageCount: 2 } },
          };
        }
        return {
          id: command.id,
          type: 'EVENT',
          payload: { type: 'RESULT', payload: { outputIds: ['out'] } },
        };
      },
    },
    fs,
    sink,
  );

  const result = await runner.execute(
    'merge-pdf',
    { inputIds: ['f1'] },
    { userId: 'u1', plan: 'basic', entitlements: ['pdf.merge'] },
  );

  assert.equal(result.type, 'TOOL_RESULT');
  assert.ok(events.some((event) => event.type === 'PAGE_COUNT_WORKER_STAGE' && event.stage === 'WORKER_PARSE_START'));
});

test('UnifiedToolRunner returns deterministic timeout error for page-count precheck', async () => {
  const registry = new GlobalRegistry();
  registry.register({
    ...tool,
    limits: {
      ...tool.limits,
      maxPagesPerFile: { free: 10, pro: 10 },
    },
  });
  const fs = new InMemoryFileSystem();
  fs.seed('f1', new Blob([new Uint8Array([1])], { type: 'application/pdf' }));
  const events: RunnerTelemetryEvent[] = [];
  const sink: TelemetrySink = { track: (event) => events.push(event) };

  const runner = new UnifiedToolRunner(
    registry,
    {
      dispatch: async (command: IWorkerCommand): Promise<IWorkerEvent> => {
        if (command.payload.type === 'GET_PDF_PAGE_COUNT') {
          return new Promise<IWorkerEvent>(() => undefined);
        }
        return {
          id: command.id,
          type: 'EVENT',
          payload: { type: 'RESULT', payload: { outputIds: ['out'] } },
        };
      },
    },
    fs,
    sink,
    { pageCountTimeoutMs: 5 },
  );

  const result = await runner.execute(
    'merge-pdf',
    { inputIds: ['f1'] },
    { userId: 'u1', plan: 'basic', entitlements: ['pdf.merge'] },
  );

  assert.equal(result.type, 'TOOL_ERROR');
  if (result.type === 'TOOL_ERROR') {
    assert.equal(result.code, 'PAGE_COUNT_CHECK_TIMEOUT');
    assert.match(result.message, /timed out/i);
  }
  assert.ok(events.some((event) => event.type === 'PAGE_COUNT_CHECK_ERROR' && event.code === 'PAGE_COUNT_CHECK_TIMEOUT'));
});
