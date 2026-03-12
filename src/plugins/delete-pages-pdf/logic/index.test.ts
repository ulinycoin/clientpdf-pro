import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryFileSystem } from '../../test-utils/in-memory-fs';
import { run } from './index';
import { createValidPdfBlob } from '../../../shared/test/create-valid-pdf';

test('delete-pages-pdf logic returns a PDF blob', async () => {
    const fs = new InMemoryFileSystem();
    const pdf = await createValidPdfBlob(2); // 2 pages
    fs.seed('f1', pdf);

    const result = await run({
        inputIds: ['f1'],
        fs,
        options: { pages: '2' } // Delete page 2
    });

    assert.equal(result.outputIds.length, 1);
    const out = await fs.read(result.outputIds[0]);
    assert.equal(await out.getType(), 'application/pdf');
});

test('delete-pages-pdf logic handles ranges and multiples', async () => {
    const fs = new InMemoryFileSystem();
    const pdf = await createValidPdfBlob(5); // 5 pages
    fs.seed('f1', pdf);

    const result = await run({
        inputIds: ['f1'],
        fs,
        options: { pages: '1, 3-4' } // Delete pages 1, 3, 4
    });

    assert.equal(result.outputIds.length, 1);
});

test('delete-pages-pdf logic rejects empty input', async () => {
    const fs = new InMemoryFileSystem();
    await assert.rejects(() => run({ inputIds: [], fs }), /at least one input file/);
});
