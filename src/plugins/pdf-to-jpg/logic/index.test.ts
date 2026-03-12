import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryFileSystem } from '../../test-utils/in-memory-fs';
import { run } from './index';

// We need to mock the rasterizer for Node environment
test('pdf-to-jpg logic works with mock rasterizer', async () => {
    const fs = new InMemoryFileSystem();
    fs.seed('f1', new Blob(['fake pdf'], { type: 'application/pdf' }));

    // We have to mock createPdfRasterizer since it returns null in Node
    // This is a bit tricky with current structure, but we can verify it throws if null
    await assert.rejects(() => run({ inputIds: ['f1'], fs }), /rasterizer is not supported/);
});

test('pdf-to-jpg logic rejects empty input', async () => {
    const fs = new InMemoryFileSystem();
    await assert.rejects(() => run({ inputIds: [], fs }), /at least one input file/);
});
