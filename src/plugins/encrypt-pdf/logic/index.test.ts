import assert from 'node:assert/strict';
import test from 'node:test';
import { createValidPdfBlob } from '../../../shared/test/create-valid-pdf';
import { QpdfPipelineError } from '../../../services/pdf/qpdf-errors';
import { InMemoryFileSystem } from '../../test-utils/in-memory-fs';
import { runEncryptPdf } from './index';

test('encrypt-pdf logic rejects empty input', async () => {
  const fs = new InMemoryFileSystem();
  await assert.rejects(
    () =>
      runEncryptPdf({ inputIds: [], fs, options: { userPassword: 'secret' } }, async () => ({
        encrypt: async () => new Blob(),
        decrypt: async () => new Blob(),
      })),
    /at least one input file/,
  );
});

test('encrypt-pdf logic rejects missing password', async () => {
  const fs = new InMemoryFileSystem();
  const pdf = await createValidPdfBlob(1);
  fs.seed('f1', pdf);

  await assert.rejects(
    () =>
      runEncryptPdf({ inputIds: ['f1'], fs, options: {} }, async () => ({
        encrypt: async () => new Blob(),
        decrypt: async () => new Blob(),
      })),
    (error: unknown) => {
      return error instanceof QpdfPipelineError && error.code === 'PROTECT_INVALID_OPTIONS';
    },
  );
});

test('encrypt-pdf logic writes encrypted output with qpdf engine', async () => {
  const fs = new InMemoryFileSystem();
  const pdf = await createValidPdfBlob(1);
  fs.seed('f1', pdf);

  let called = 0;
  const result = await runEncryptPdf(
    { inputIds: ['f1'], fs, options: { userPassword: 'secret', keyLength: 256 } },
    async () => ({
      encrypt: async (inputBlob, options) => {
        called += 1;
        assert.equal(options.userPassword, 'secret');
        assert.equal(options.keyLength, 256);
        return new Blob([await inputBlob.arrayBuffer()], { type: 'application/pdf' });
      },
      decrypt: async () => new Blob(),
    }),
  );

  assert.equal(called, 1);
  assert.equal(result.outputIds.length, 1);
  const out = await fs.read(result.outputIds[0]);
  assert.equal(await out.getType(), 'application/pdf');
});
