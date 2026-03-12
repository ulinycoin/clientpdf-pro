import assert from 'node:assert/strict';
import test from 'node:test';
import { toUserMessage } from './tool-execution-messages';

test('toUserMessage maps TOOL_ACCESS_DENIED', () => {
  const denied = toUserMessage({ type: 'TOOL_ACCESS_DENIED', reason: 'LIMIT_EXCEEDED' });
  assert.match(denied, /Limit exceeded/);
});

test('toUserMessage maps TOOL_ERROR by code', () => {
  const timedOut = toUserMessage({ type: 'TOOL_ERROR', message: 'x', code: 'WORKER_TIMEOUT' });
  assert.match(timedOut, /timed out/);
});

test('toUserMessage maps OCR rasterizer code', () => {
  const msg = toUserMessage({ type: 'TOOL_ERROR', message: 'x', code: 'OCR_PDF_RASTERIZER_MISSING' });
  assert.match(msg, /rasterizer/i);
});

test('toUserMessage maps OCR language-pack code', () => {
  const msg = toUserMessage({ type: 'TOOL_ERROR', message: '', code: 'OCR_LANGUAGE_PACK_UNAVAILABLE' });
  assert.match(msg, /language pack/i);
});

test('toUserMessage maps qpdf unavailable code', () => {
  const msg = toUserMessage({ type: 'TOOL_ERROR', message: 'x', code: 'PROTECT_QPDF_UNAVAILABLE' });
  assert.match(msg, /qpdf/i);
});

test('toUserMessage maps page-count timeout code', () => {
  const msg = toUserMessage({ type: 'TOOL_ERROR', message: 'x', code: 'PAGE_COUNT_CHECK_TIMEOUT' });
  assert.match(msg, /validation timed out/i);
});

test('toUserMessage maps TOOL_RESULT', () => {
  const ok = toUserMessage({ type: 'TOOL_RESULT', outputIds: ['a', 'b'] });
  assert.match(ok, /2 files generated/);
});
