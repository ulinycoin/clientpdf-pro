import assert from 'node:assert/strict';
import test from 'node:test';
import { createValidPdfBlob } from '../../../shared/test/create-valid-pdf';
import { QpdfPipelineError } from '../../../services/pdf/qpdf-errors';
import { InMemoryFileSystem } from '../../test-utils/in-memory-fs';
import { runProtectPdf } from './index';

test('protect-pdf logic rejects empty input', async () => {
  const fs = new InMemoryFileSystem();
  await assert.rejects(
    () =>
      runProtectPdf({ inputIds: [], fs, options: { userPassword: 'secret' } }, async () => ({
        encrypt: async () => new Blob(),
        decrypt: async () => new Blob(),
      })),
    /at least one input file/,
  );
});

test('protect-pdf logic rejects missing password outside permissions-only mode', async () => {
  const fs = new InMemoryFileSystem();
  const pdf = await createValidPdfBlob(1);
  fs.seed('f1', pdf);

  await assert.rejects(
    () =>
      runProtectPdf({ inputIds: ['f1'], fs, options: {} }, async () => ({
        encrypt: async () => new Blob(),
        decrypt: async () => new Blob(),
      })),
    (error: unknown) => error instanceof QpdfPipelineError && error.code === 'PROTECT_INVALID_OPTIONS',
  );
});

test('protect-pdf logic maps v3-style permissions to qpdf encrypt options', async () => {
  const fs = new InMemoryFileSystem();
  const pdf = await createValidPdfBlob(1);
  fs.seed('f1', pdf);

  let called = 0;
  const result = await runProtectPdf(
    {
      inputIds: ['f1'],
      fs,
      options: {
        permissionsOnly: true,
        ownerPassword: 'owner-secret',
        keyLength: 128,
        printing: 'low',
        copying: false,
        modifying: false,
        annotating: false,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: false,
      },
    },
    async () => ({
      encrypt: async (inputBlob, options) => {
        called += 1;
        assert.equal(options.userPassword, '');
        assert.equal(options.ownerPassword, 'owner-secret');
        assert.equal(options.keyLength, 128);
        assert.equal(options.printing, 'low');
        assert.equal(options.modify, 'none');
        assert.equal(options.extract, false);
        assert.equal(options.annotate, false);
        assert.equal(options.form, true);
        assert.equal(options.accessibility, true);
        assert.equal(options.assemble, false);
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

test('protect-pdf logic sets fallback owner password in permissions-only mode', async () => {
  const fs = new InMemoryFileSystem();
  const pdf = await createValidPdfBlob(1);
  fs.seed('f1', pdf);

  await runProtectPdf(
    {
      inputIds: ['f1'],
      fs,
      options: {
        permissionsOnly: true,
      },
    },
    async () => ({
      encrypt: async (inputBlob, options) => {
        assert.equal(options.userPassword, '');
        assert.equal(options.ownerPassword, 'owner-only-restrictions');
        return new Blob([await inputBlob.arrayBuffer()], { type: 'application/pdf' });
      },
      decrypt: async () => new Blob(),
    }),
  );
});
