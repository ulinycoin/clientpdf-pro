import assert from 'node:assert/strict';
import test from 'node:test';
import { detectTablesFromWords, renderDetectedTablesAsMarkdown } from './table-detector';
import type { OcrWord } from './ocr-engine';

function word(text: string, x0: number, y0: number, x1: number, y1: number): OcrWord {
  return {
    text,
    confidence: 95,
    bbox: { x0, y0, x1, y1 },
  };
}

test('detectTablesFromWords detects aligned multi-row tables', () => {
  const words: OcrWord[] = [
    word('Name', 10, 10, 50, 24),
    word('Qty', 120, 10, 145, 24),
    word('Price', 210, 10, 255, 24),
    word('Apples', 10, 42, 62, 56),
    word('2', 128, 42, 134, 56),
    word('3.00', 214, 42, 248, 56),
    word('Oranges', 10, 74, 72, 88),
    word('5', 128, 74, 134, 88),
    word('7.50', 214, 74, 248, 88),
  ];

  const tables = detectTablesFromWords(words);

  assert.equal(tables.length, 1);
  assert.equal(tables[0].columns, 3);
  assert.deepEqual(
    tables[0].rows.map((row) => row.cells.map((cell) => cell.text)),
    [
      ['Name', 'Qty', 'Price'],
      ['Apples', '2', '3.00'],
      ['Oranges', '5', '7.50'],
    ],
  );

  assert.equal(
    renderDetectedTablesAsMarkdown(tables),
    [
      '| Name | Qty | Price |',
      '| --- | --- | --- |',
      '| Apples | 2 | 3.00 |',
      '| Oranges | 5 | 7.50 |',
    ].join('\n'),
  );
});

test('detectTablesFromWords ignores ordinary paragraph lines', () => {
  const words: OcrWord[] = [
    word('This', 10, 10, 42, 24),
    word('is', 52, 10, 64, 24),
    word('a', 74, 10, 80, 24),
    word('normal', 90, 10, 138, 24),
    word('sentence', 148, 10, 210, 24),
    word('with', 260, 10, 290, 24),
    word('a', 300, 10, 306, 24),
    word('large', 316, 10, 356, 24),
    word('gap', 366, 10, 392, 24),
    word('Another', 10, 42, 64, 56),
    word('sentence', 74, 42, 136, 56),
    word('continues', 146, 42, 212, 56),
    word('here', 260, 42, 292, 56),
    word('too', 302, 42, 324, 56),
  ];

  assert.deepEqual(detectTablesFromWords(words), []);
});
