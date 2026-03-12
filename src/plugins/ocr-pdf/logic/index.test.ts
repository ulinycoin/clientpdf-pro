import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryFileSystem } from '../../test-utils/in-memory-fs';
import { run } from './index';

test('ocr-pdf logic returns deterministic error for PDF without rasterizer', async () => {
  const fs = new InMemoryFileSystem();
  fs.seed('f1', new Blob([new Uint8Array([1, 2, 3])], { type: 'application/pdf' }));

  await assert.rejects(
    () => run({ inputIds: ['f1'], fs }),
    (error) =>
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 'OCR_PDF_RASTERIZER_MISSING',
  );
});

test('ocr-pdf logic rejects empty input', async () => {
  const fs = new InMemoryFileSystem();
  await assert.rejects(() => run({ inputIds: [], fs }), /at least one input file/);
});
