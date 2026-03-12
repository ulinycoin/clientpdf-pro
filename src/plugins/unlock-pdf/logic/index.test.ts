import assert from 'node:assert/strict';
import test from 'node:test';
import { createValidPdfBlob } from '../../../shared/test/create-valid-pdf';
import { InMemoryFileSystem } from '../../test-utils/in-memory-fs';
import { runUnlockPdf } from './index';

test('unlock-pdf logic rejects empty input', async () => {
  const fs = new InMemoryFileSystem();
  await assert.rejects(
    () => runUnlockPdf({ inputIds: [], fs }, async () => ({ encrypt: async () => new Blob(), decrypt: async () => new Blob() })),
    /at least one input file/,
  );
});

test('unlock-pdf logic writes output with qpdf engine', async () => {
  const fs = new InMemoryFileSystem();
  const pdf = await createValidPdfBlob(1);
  fs.seed('f1', pdf);

  let called = 0;
  const result = await runUnlockPdf(
    { inputIds: ['f1'], fs, options: { password: 'secret' } },
    async () => ({
      encrypt: async () => new Blob(),
      decrypt: async (inputBlob, options) => {
        called += 1;
        assert.equal(options?.password, 'secret');
        return new Blob([await inputBlob.arrayBuffer()], { type: 'application/pdf' });
      },
    }),
  );

  assert.equal(called, 1);
  assert.equal(result.outputIds.length, 1);
  const out = await fs.read(result.outputIds[0]);
  assert.equal(await out.getType(), 'application/pdf');
});
