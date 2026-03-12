import assert from 'node:assert/strict';
import test from 'node:test';
import { WebFileSystemAdapter } from './web-filesystem-adapter';

test('WebFileSystemAdapter writes, reads and deletes file in fallback mode', async () => {
  const fs = new WebFileSystemAdapter();
  const input = new Blob([new Uint8Array([1, 2, 3])], { type: 'application/pdf' });

  const entry = await fs.write(input);
  const readBack = await fs.read(entry.id);
  const size = await readBack.getSize();

  assert.equal(size, 3);
  assert.equal(await readBack.getType(), 'application/pdf');

  await fs.delete(entry.id);
  await assert.rejects(() => fs.read(entry.id), /File not found/);
});
