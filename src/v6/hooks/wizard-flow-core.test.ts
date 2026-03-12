import { strict as assert } from 'node:assert';
import test from 'node:test';
import type { WorkerOrchestrator } from '../../core/workers/worker-orchestrator';
import { VfsQuotaExceededError } from '../../core/vfs/virtual-file-system';
import type { LimitService } from '../components/Wizard/types';
import { WizardFlowCore } from './wizard-flow-core';

function createFile(name: string): File {
  return new File([`content-${name}`], `${name}.pdf`, { type: 'application/pdf' });
}

function createRuntime(params?: {
  writeImpl?: (blob: Blob) => Promise<{ id: string }>;
  deleteImpl?: (id: string) => Promise<void>;
  dispatchImpl?: WorkerOrchestrator['dispatch'];
}) {
  let index = 0;
  const runtime = {
    vfs: {
      write: params?.writeImpl ?? (async () => ({ id: `file-${++index}` })),
      delete: params?.deleteImpl ?? (async () => undefined),
    },
    registry: {
      get: () => ({
        limits: {},
      }),
    },
    workerOrchestrator: {
      dispatch:
        params?.dispatchImpl ??
        (async (_command, onEvent) => {
          onEvent?.({ id: 'x', type: 'EVENT', payload: { type: 'PROGRESS', payload: { progress: 55 } } });
          return { id: 'x', type: 'EVENT', payload: { type: 'RESULT', payload: { outputIds: ['out-1'] } } };
        }),
    },
  };

  return runtime as any;
}

const allowAllLimitService: LimitService = {
  check: async () => ({ allowed: true }),
};

test('WizardFlowCore: quota error keeps step on upload and emits toast', async () => {
  const toasts: string[] = [];
  const runtime = createRuntime({
    writeImpl: async () => {
      throw new VfsQuotaExceededError('VFS total quota exceeded');
    },
  });

  const core = new WizardFlowCore({
    runtime,
    toolId: 'merge-pdf',
    context: { userId: 'u1', plan: 'pro', entitlements: ['pdf.merge'] },
    limitService: allowAllLimitService,
    onToast: (message) => toasts.push(message),
  });

  const state = await core.handleFilesAdded([createFile('a')]);

  assert.equal(state.step, 'upload');
  assert.equal(state.isValidating, false);
  assert.equal(state.fileIds.length, 0);
  assert.equal(state.toast, 'Storage quota exceeded. Free some space and retry.');
  assert.equal(toasts.length, 1);
});

test('WizardFlowCore: limit fail cleans uploaded files and shows upsell', async () => {
  const deletedIds: string[] = [];
  const runtime = createRuntime({
    deleteImpl: async (id) => {
      deletedIds.push(id);
    },
  });

  const limitService: LimitService = {
    check: async () => ({ allowed: false, reason: 'Upgrade required' }),
  };

  const core = new WizardFlowCore({
    runtime,
    toolId: 'merge-pdf',
    context: { userId: 'u1', plan: 'basic', entitlements: ['pdf.merge'] },
    limitService,
  });

  const state = await core.handleFilesAdded([createFile('a'), createFile('b')]);

  assert.equal(state.step, 'upload');
  assert.equal(state.fileIds.length, 0);
  assert.equal(state.upsellReason, 'Upgrade required');
  assert.deepEqual(deletedIds.sort(), ['file-1', 'file-2']);
});

test('WizardFlowCore: cancelProcessing moves flow back to config with canceled error', async () => {
  const runtime = createRuntime({
    dispatchImpl: async (_command, _onEvent, signal) =>
      new Promise((resolve) => {
        signal?.addEventListener('abort', () => {
          resolve({
            id: 'run-1',
            type: 'EVENT',
            payload: { type: 'ERROR', payload: { code: 'WORKER_ABORTED', message: 'Worker execution aborted' } },
          });
        });
      }),
  });

  const core = new WizardFlowCore({
    runtime,
    toolId: 'merge-pdf',
    context: { userId: 'u1', plan: 'pro', entitlements: ['pdf.merge'] },
    limitService: allowAllLimitService,
  });

  await core.handleFilesAdded([createFile('a')]);

  const processingPromise = core.startProcessing({});
  core.cancelProcessing();
  const state = await processingPromise;

  assert.equal(state.step, 'config');
  assert.equal(state.isProcessing, false);
  assert.equal(state.error, 'Processing canceled');
});

test('WizardFlowCore: successful processing reaches result and stores outputs', async () => {
  const runtime = createRuntime();
  const core = new WizardFlowCore({
    runtime,
    toolId: 'merge-pdf',
    context: { userId: 'u1', plan: 'pro', entitlements: ['pdf.merge'] },
    limitService: allowAllLimitService,
  });

  await core.handleFilesAdded([createFile('a')]);
  const state = await core.startProcessing({});

  assert.equal(state.step, 'result');
  assert.equal(state.progress, 100);
  assert.deepEqual(state.outputIds, ['out-1']);
});

test('WizardFlowCore: worker timeout returns to config with timeout error', async () => {
  const runtime = createRuntime({
    dispatchImpl: async () => ({
      id: 'run-timeout',
      type: 'EVENT',
      payload: { type: 'ERROR', payload: { code: 'WORKER_TIMEOUT', message: 'Worker timeout exceeded' } },
    }),
  });

  const core = new WizardFlowCore({
    runtime,
    toolId: 'merge-pdf',
    context: { userId: 'u1', plan: 'pro', entitlements: ['pdf.merge'] },
    limitService: allowAllLimitService,
  });

  await core.handleFilesAdded([createFile('a')]);
  const state = await core.startProcessing({});

  assert.equal(state.step, 'config');
  assert.equal(state.isProcessing, false);
  assert.equal(state.error, 'Worker timeout exceeded');
});

test('WizardFlowCore: retry after transient worker error succeeds', async () => {
  let attempts = 0;
  const runtime = createRuntime({
    dispatchImpl: async () => {
      attempts += 1;
      if (attempts === 1) {
        return {
          id: 'run-err',
          type: 'EVENT',
          payload: { type: 'ERROR', payload: { code: 'WORKER_CRASH', message: 'Worker crashed' } },
        };
      }
      return {
        id: 'run-ok',
        type: 'EVENT',
        payload: { type: 'RESULT', payload: { outputIds: ['out-retry'] } },
      };
    },
  });

  const core = new WizardFlowCore({
    runtime,
    toolId: 'merge-pdf',
    context: { userId: 'u1', plan: 'pro', entitlements: ['pdf.merge'] },
    limitService: allowAllLimitService,
  });

  await core.handleFilesAdded([createFile('a')]);

  const failed = await core.startProcessing({});
  assert.equal(failed.step, 'config');
  assert.equal(failed.error, 'Worker crashed');

  const recovered = await core.startProcessing({});
  assert.equal(recovered.step, 'result');
  assert.equal(recovered.error, null);
  assert.deepEqual(recovered.outputIds, ['out-retry']);
});
