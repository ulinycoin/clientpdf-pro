import { WebFileSystemAdapter } from '../io/web-filesystem-adapter';
import { warmupPdfLib } from '../pdf/page-count';
import { createRegistry } from '../registry/register-tools';
import type { IWorkerCommand } from '../types/contracts';
import { executeWorkerCommand } from './worker-runtime';

const registry = createRegistry();
const fs = new WebFileSystemAdapter();

// Start loading heavy PDF parser code off the hot path for first pre-check.
void warmupPdfLib().catch(() => {
  // Keep worker startup resilient: metadata calls will retry lazy-load on demand.
});

self.onmessage = async (event: MessageEvent<IWorkerCommand>) => {
  const command = event.data;
  const finalEvent = await executeWorkerCommand(command, { registry, fs }, (progressEvent) => {
    self.postMessage(progressEvent);
  });
  self.postMessage(finalEvent);
};
