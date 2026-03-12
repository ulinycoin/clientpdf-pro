import assert from 'node:assert/strict';
import test from 'node:test';
import { createValidPdfBlob } from '../../shared/test/create-valid-pdf';
import { createPdfEngine } from './pdf-engine';

test('createPdfEngine provides merge/split behavior', async () => {
  const engine = await createPdfEngine();

  const a = await createValidPdfBlob(1);
  const b = await createValidPdfBlob(2);

  const merged = await engine.merge([a, b]);
  assert.ok(merged.size >= 2);

  const parts = await engine.split(a);
  assert.ok(parts.length >= 1);
});
