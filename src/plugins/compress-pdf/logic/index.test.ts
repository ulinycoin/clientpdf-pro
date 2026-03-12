import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryFileSystem } from '../../test-utils/in-memory-fs';
import { run } from './index';
import { createValidPdfBlob } from '../../../shared/test/create-valid-pdf';

test('compress-pdf logic returns a PDF blob', async () => {
    const fs = new InMemoryFileSystem();
    const pdf = new File([await createValidPdfBlob(1)], 'sample.pdf', { type: 'application/pdf' });
    fs.seed('f1', pdf);

    const result = await run({
        inputIds: ['f1'],
        fs,
        options: { quality: 'high' }
    });

    assert.equal(result.outputIds.length, 1);
    const out = await fs.read(result.outputIds[0]);
    assert.equal(await out.getType(), 'application/pdf');
    assert.equal(out.getName(), 'sample-compressed.pdf');
});

test('compress-pdf logic rejects empty input', async () => {
    const fs = new InMemoryFileSystem();
    await assert.rejects(() => run({ inputIds: [], fs }), /at least one input file/);
});
