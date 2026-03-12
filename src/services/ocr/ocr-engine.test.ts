import assert from 'node:assert/strict';
import test from 'node:test';
import { createOcrEngine } from './ocr-engine';

test('createOcrEngine rejects direct PDF input', async () => {
  const engine = await createOcrEngine();
  await assert.rejects(
    () => engine.recognize(new Blob([new Uint8Array([1, 2, 3])], { type: 'application/pdf' })),
    (error) =>
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      ((error as { code?: unknown }).code === 'OCR_UNSUPPORTED_INPUT' ||
        (error as { code?: unknown }).code === 'OCR_ENGINE_UNAVAILABLE'),
  );
});
