import assert from 'node:assert/strict';
import test from 'node:test';
import { extractPdfTextSegments, parsePdfTextOperators } from './pdf-content-stream-parser';

test('parsePdfTextOperators parses literal Tj inside BT/ET', () => {
  const content = 'BT /F1 12 Tf 100 700 Td (Hello world) Tj ET';
  const operators = parsePdfTextOperators(content);
  assert.equal(operators.length, 1);
  assert.equal(operators[0]?.operator, 'Tj');
  assert.deepEqual(operators[0]?.textSegments, ['Hello world']);
});

test('parsePdfTextOperators decodes escaped literal and hex strings', () => {
  const content = 'BT (Hello \\(PDF\\)) Tj <576F726C64> Tj ET';
  const operators = parsePdfTextOperators(content);
  assert.equal(operators.length, 2);
  assert.deepEqual(operators[0]?.textSegments, ['Hello (PDF)']);
  assert.deepEqual(operators[1]?.textSegments, ['World']);
});

test('parsePdfTextOperators parses TJ arrays with mixed entries', () => {
  const content = 'BT [(Re) -120 (pla) 30 <6365>] TJ ET';
  const operators = parsePdfTextOperators(content);
  assert.equal(operators.length, 1);
  assert.equal(operators[0]?.operator, 'TJ');
  assert.deepEqual(operators[0]?.textSegments, ['Re', 'pla', 'ce']);
});

test('extractPdfTextSegments ignores text operators outside BT/ET', () => {
  const content = '(OUT) Tj BT (IN) Tj ET';
  const segments = extractPdfTextSegments(content);
  assert.deepEqual(segments, ['IN']);
});

test('parsePdfTextOperators captures text matrix position from Tm and Td', () => {
  const content = 'BT 1 0 0 1 72 700 Tm (A) Tj 0 -24 Td (B) Tj ET';
  const operators = parsePdfTextOperators(content);
  assert.equal(operators.length, 2);
  assert.equal(operators[0]?.textMatrixX, 72);
  assert.equal(operators[0]?.textMatrixY, 700);
  assert.equal(operators[1]?.textMatrixX, 72);
  assert.equal(operators[1]?.textMatrixY, 676);
});

test('parsePdfTextOperators tracks TL/T* and Tf font size', () => {
  const content = 'BT /F1 18 Tf 1 0 0 1 100 500 Tm 22 TL (L1) Tj T* (L2) Tj ET';
  const operators = parsePdfTextOperators(content);
  assert.equal(operators.length, 2);
  assert.equal(operators[0]?.textMatrixX, 100);
  assert.equal(operators[0]?.textMatrixY, 500);
  assert.equal(operators[0]?.fontSize, 18);
  assert.equal(operators[1]?.textMatrixX, 100);
  assert.equal(operators[1]?.textMatrixY, 478);
  assert.equal(operators[1]?.fontSize, 18);
});
