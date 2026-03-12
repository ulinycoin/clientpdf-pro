import assert from 'node:assert/strict';
import test from 'node:test';
import { mergePdfDefinition } from '../../plugins/merge-pdf/definition';
import { createValidPdfBlob } from '../../shared/test/create-valid-pdf';
import { bootstrapPlatform } from './bootstrap';
import { runToolWithTempInputs } from './run-tool-with-temp-inputs';

test('runToolWithTempInputs cleans temp input scope after execution', async () => {
  const boot = bootstrapPlatform('in-process', [mergePdfDefinition]);
  const a = await createValidPdfBlob(1);
  const b = await createValidPdfBlob(1);

  const { result, tempInputIds } = await runToolWithTempInputs(
    boot.runtime,
    'merge-pdf',
    [a, b],
    {
      userId: 'u1',
      plan: 'pro',
      entitlements: ['pdf.merge'],
    },
  );

  assert.equal(result.type, 'TOOL_RESULT');
  for (const id of tempInputIds) {
    await assert.rejects(() => boot.runtime.vfs.read(id), /File not found|Missing file/);
  }
});
