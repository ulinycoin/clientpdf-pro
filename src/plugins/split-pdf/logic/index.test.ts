import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryFileSystem } from '../../test-utils/in-memory-fs';
import { createValidPdfBlob } from '../../../shared/test/create-valid-pdf';
import { run } from './index';

test('split-pdf logic writes one output per input', async () => {
  const fs = new InMemoryFileSystem();
  fs.seed('f1', await createValidPdfBlob(2));
  fs.seed('f2', await createValidPdfBlob(1));

  const result = await run({ inputIds: ['f1', 'f2'], fs });
  assert.equal(result.outputIds.length, 3);
});

test('split-pdf logic rejects empty input', async () => {
  const fs = new InMemoryFileSystem();
  await assert.rejects(() => run({ inputIds: [], fs }), /at least one input file/);
});
