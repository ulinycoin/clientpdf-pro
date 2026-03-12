import assert from 'node:assert/strict';
import test from 'node:test';
import type { IWorkerCommand, IWorkerEvent } from '../types/contracts';
import { WebWorkerOrchestrator } from './worker-orchestrator';

class FakeWorker {
  onmessage: ((event: { data: IWorkerEvent }) => void) | null = null;
  onerror: ((event: { message?: string }) => void) | null = null;
  private terminated = false;

  postMessage(command: IWorkerCommand): void {
    setTimeout(() => {
      if (this.terminated || !this.onmessage) {
        return;
      }
      this.onmessage({
        data: {
          id: command.id,
          type: 'EVENT',
          payload: { type: 'PROGRESS', payload: { progress: 50 } },
        },
      });
    }, 0);

    setTimeout(() => {
      if (this.terminated || !this.onmessage) {
        return;
      }
      this.onmessage({
        data: {
          id: command.id,
          type: 'EVENT',
          payload: { type: 'RESULT', payload: { outputIds: ['out-1'] } },
        },
      });
    }, 1);
  }

  terminate(): void {
    this.terminated = true;
  }
}

test('WebWorkerOrchestrator forwards progress and resolves on final result', async () => {
  const orchestrator = new WebWorkerOrchestrator(() => new FakeWorker(), 500);
  const seen: string[] = [];

  const result = await orchestrator.dispatch(
    {
      id: 'cmd-1',
      type: 'COMMAND',
      payload: { type: 'READ_FILE', payload: { fileId: 'f1' } },
    },
    (event) => {
      seen.push(event.payload.type);
    },
  );

  assert.equal(result.payload.type, 'RESULT');
  assert.deepEqual(seen, ['PROGRESS', 'RESULT']);
});

test('WebWorkerOrchestrator returns timeout error if worker does not answer', async () => {
  const silentWorker = {
    onmessage: null as ((event: { data: IWorkerEvent }) => void) | null,
    onerror: null as ((event: { message?: string }) => void) | null,
    postMessage: () => {},
    terminate: () => {},
  };

  const orchestrator = new WebWorkerOrchestrator(() => silentWorker, 5);
  const result = await orchestrator.dispatch({
    id: 'cmd-timeout',
    type: 'COMMAND',
    payload: { type: 'READ_FILE', payload: { fileId: 'f1' } },
  });

  assert.equal(result.payload.type, 'ERROR');
  if (result.payload.type === 'ERROR') {
    assert.equal(result.payload.payload.code, 'WORKER_TIMEOUT');
  }
});

test('WebWorkerOrchestrator resolves on PAGE_COUNT_RESULT final event', async () => {
  const pageCountWorker = {
    onmessage: null as ((event: { data: IWorkerEvent }) => void) | null,
    onerror: null as ((event: { message?: string }) => void) | null,
    postMessage: (command: IWorkerCommand) => {
      setTimeout(() => {
        pageCountWorker.onmessage?.({
          data: {
            id: command.id,
            type: 'EVENT',
            payload: { type: 'PAGE_COUNT_RESULT', payload: { fileId: 'f1', pageCount: 2 } },
          },
        });
      }, 0);
    },
    terminate: () => {},
  };

  const orchestrator = new WebWorkerOrchestrator(() => pageCountWorker, 500);
  const result = await orchestrator.dispatch({
    id: 'cmd-page-count',
    type: 'COMMAND',
    payload: { type: 'GET_PDF_PAGE_COUNT', payload: { fileId: 'f1' } },
  });

  assert.equal(result.payload.type, 'PAGE_COUNT_RESULT');
});

test('WebWorkerOrchestrator resolves on TEXT_LAYER_RESULT final event', async () => {
  const textLayerWorker = {
    onmessage: null as ((event: { data: IWorkerEvent }) => void) | null,
    onerror: null as ((event: { message?: string }) => void) | null,
    postMessage: (command: IWorkerCommand) => {
      setTimeout(() => {
        textLayerWorker.onmessage?.({
          data: {
            id: command.id,
            type: 'EVENT',
            payload: {
              type: 'TEXT_LAYER_RESULT',
              payload: { fileId: 'f1', pageNumber: 1, spans: [] },
            },
          },
        });
      }, 0);
    },
    terminate: () => {},
  };

  const orchestrator = new WebWorkerOrchestrator(() => textLayerWorker, 500);
  const result = await orchestrator.dispatch({
    id: 'cmd-text-layer',
    type: 'COMMAND',
    payload: { type: 'GET_PDF_TEXT_LAYER', payload: { fileId: 'f1', pageNumber: 1 } },
  });

  assert.equal(result.payload.type, 'TEXT_LAYER_RESULT');
});

test('WebWorkerOrchestrator resolves on STUDIO_TEXT_EDITS_APPLIED final event', async () => {
  const editApplyWorker = {
    onmessage: null as ((event: { data: IWorkerEvent }) => void) | null,
    onerror: null as ((event: { message?: string }) => void) | null,
    postMessage: (command: IWorkerCommand) => {
      setTimeout(() => {
        editApplyWorker.onmessage?.({
          data: {
            id: command.id,
            type: 'EVENT',
            payload: {
              type: 'STUDIO_TEXT_EDITS_APPLIED',
              payload: {
                fileId: 'f1',
                pageIndex: 0,
                outputId: 'out-1',
                overflowDetected: false,
                trueReplaceApplied: false,
                trueReplaceFallbackReason: 'INELIGIBLE_EDIT_PAYLOAD',
              },
            },
          },
        });
      }, 0);
    },
    terminate: () => {},
  };

  const orchestrator = new WebWorkerOrchestrator(() => editApplyWorker, 500);
  const result = await orchestrator.dispatch({
    id: 'cmd-apply-studio-edits',
    type: 'COMMAND',
    payload: { type: 'APPLY_STUDIO_TEXT_EDITS', payload: { fileId: 'f1', pageIndex: 0, elements: [] } },
  });

  assert.equal(result.payload.type, 'STUDIO_TEXT_EDITS_APPLIED');
});

test('WebWorkerOrchestrator returns WORKER_ABORTED for pre-aborted signal', async () => {
  const worker = {
    onmessage: null as ((event: { data: IWorkerEvent }) => void) | null,
    onerror: null as ((event: { message?: string }) => void) | null,
    postMessage: () => {
      throw new Error('postMessage must not be called for pre-aborted signal');
    },
    terminate: () => {},
  };

  const orchestrator = new WebWorkerOrchestrator(() => worker, 500);
  const abortController = new AbortController();
  abortController.abort();

  const result = await orchestrator.dispatch(
    {
      id: 'cmd-pre-aborted',
      type: 'COMMAND',
      payload: { type: 'READ_FILE', payload: { fileId: 'f1' } },
    },
    undefined,
    abortController.signal,
  );

  assert.equal(result.payload.type, 'ERROR');
  if (result.payload.type === 'ERROR') {
    assert.equal(result.payload.payload.code, 'WORKER_ABORTED');
  }
});

test('WebWorkerOrchestrator returns WORKER_ABORTED when aborted in-flight', async () => {
  const silentWorker = {
    onmessage: null as ((event: { data: IWorkerEvent }) => void) | null,
    onerror: null as ((event: { message?: string }) => void) | null,
    postMessage: () => {},
    terminate: () => {},
  };

  const orchestrator = new WebWorkerOrchestrator(() => silentWorker, 500);
  const abortController = new AbortController();

  const resultPromise = orchestrator.dispatch(
    {
      id: 'cmd-inflight-aborted',
      type: 'COMMAND',
      payload: { type: 'READ_FILE', payload: { fileId: 'f1' } },
    },
    undefined,
    abortController.signal,
  );
  abortController.abort();
  const result = await resultPromise;

  assert.equal(result.payload.type, 'ERROR');
  if (result.payload.type === 'ERROR') {
    assert.equal(result.payload.payload.code, 'WORKER_ABORTED');
  }
});
