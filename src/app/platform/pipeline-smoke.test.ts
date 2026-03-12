import assert from 'node:assert/strict';
import test from 'node:test';
import { mergePdfDefinition } from '../../plugins/merge-pdf/definition';
import { ocrPdfDefinition } from '../../plugins/ocr-pdf/definition';
import { splitPdfDefinition } from '../../plugins/split-pdf/definition';
import { createValidPdfBlob } from '../../shared/test/create-valid-pdf';
import { bootstrapPlatform } from './bootstrap';
import { runTool } from './run-tool';

const defs = [mergePdfDefinition, splitPdfDefinition, ocrPdfDefinition];

test('pipeline smoke: merge -> split -> ocr (deterministic fallback when PDF rasterizer is unavailable)', async () => {
  const boot = bootstrapPlatform('in-process', defs);

  const a = await createValidPdfBlob(1);
  const b = await createValidPdfBlob(1);
  const aEntry = await boot.runtime.vfs.write(a);
  const bEntry = await boot.runtime.vfs.write(b);

  const context = {
    userId: 'smoke-user',
    plan: 'pro' as const,
    entitlements: ['pdf.merge', 'pdf.split', 'pdf.ocr'],
    usageThisMonthByTool: {},
  };

  const mergeResult = await runTool(
    boot.runtime,
    'merge-pdf',
    { inputIds: [aEntry.id, bEntry.id] },
    context,
  );
  assert.equal(mergeResult.type, 'TOOL_RESULT');
  if (mergeResult.type !== 'TOOL_RESULT') {
    return;
  }

  const splitResult = await runTool(
    boot.runtime,
    'split-pdf',
    { inputIds: [mergeResult.outputIds[0]] },
    context,
  );
  assert.equal(splitResult.type, 'TOOL_RESULT');
  if (splitResult.type !== 'TOOL_RESULT') {
    return;
  }
  assert.ok(splitResult.outputIds.length >= 1);

  const ocrResult = await runTool(
    boot.runtime,
    'ocr-pdf',
    { inputIds: [splitResult.outputIds[0]] },
    context,
  );
  assert.equal(ocrResult.type, 'TOOL_ERROR');
  if (ocrResult.type === 'TOOL_ERROR') {
    assert.equal(ocrResult.code, 'OCR_PDF_RASTERIZER_MISSING');
  }
});
