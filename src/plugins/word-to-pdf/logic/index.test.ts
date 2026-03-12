import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryFileSystem } from '../../test-utils/in-memory-fs';
import { run } from './index';

test('word-to-pdf logic rejects empty input', async () => {
    const fs = new InMemoryFileSystem();
    await assert.rejects(() => run({ inputIds: [], fs }), /at least one input file/);
});

test('word-to-pdf logic rejects unsupported non-docx container', async () => {
    const fs = new InMemoryFileSystem();
    fs.seed('f1', new Blob(['not a docx'], { type: 'application/msword' }));

    await assert.rejects(
      () => run({ inputIds: ['f1'], fs }),
      /Unsupported Word file format/,
    );
});

test('word-to-pdf logic rejects legacy .doc files', async () => {
    const fs = new InMemoryFileSystem();
    const legacyDocHeader = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00, 0x00]);
    fs.seed('legacy-doc', new Blob([legacyDocHeader], { type: 'application/msword' }));

    await assert.rejects(
      () => run({ inputIds: ['legacy-doc'], fs }),
      /Legacy \.doc is not supported/,
    );
});
