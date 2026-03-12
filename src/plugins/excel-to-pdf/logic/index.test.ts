import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryFileSystem } from '../../test-utils/in-memory-fs';
import { findNonEmptyColumnIndexes, parsePageSelection, run, splitIntoColumnBands, stripEmptyColumns } from './index';

test('excel-to-pdf logic rejects empty input', async () => {
    const fs = new InMemoryFileSystem();
    await assert.rejects(() => run({ inputIds: [], fs }), /at least one input file/);
});

test('excel-to-pdf logic throws on invalid excel', async () => {
    const fs = new InMemoryFileSystem();
    fs.seed('f1', new Blob(['not an excel'], { type: 'application/vnd.ms-excel' }));

    // Excel parser should fail on random bytes
    await assert.rejects(() => run({ inputIds: ['f1'], fs }));
});

test('excel-to-pdf removes empty columns while preserving merged columns', () => {
    const rows = [
        ['Name', '', 'Amount', ''],
        ['Alice', '', 100, ''],
        ['Bob', '', 220, ''],
    ];
    const mergedColumns = new Set<number>([1]);

    const kept = findNonEmptyColumnIndexes(rows, mergedColumns);
    assert.deepEqual(kept, [0, 1, 2]);
    assert.deepEqual(stripEmptyColumns(rows, mergedColumns), [
        ['Name', '', 'Amount'],
        ['Alice', '', 100],
        ['Bob', '', 220],
    ]);
});

test('excel-to-pdf splits wide tables into horizontal bands with sticky first column', () => {
    const widths = [90, 180, 180, 180];
    const bands = splitIntoColumnBands(widths, 320, 1);
    assert.deepEqual(bands, [
        [0, 1],
        [0, 2],
        [0, 3],
    ]);
});

test('excel-to-pdf parses page selection ranges', () => {
    const matches = parsePageSelection('1,3-5');
    assert.equal(matches(1), true);
    assert.equal(matches(2), false);
    assert.equal(matches(4), true);
    assert.equal(matches(6), false);
});

test('excel-to-pdf rejects invalid page selection', () => {
    assert.throws(() => parsePageSelection('3-1'), /Invalid page range/);
    assert.throws(() => parsePageSelection('x'), /Invalid page token/);
});
