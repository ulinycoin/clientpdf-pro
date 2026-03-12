import assert from 'node:assert/strict';
import test from 'node:test';
import { buildFontSupportProfile } from './font-profile';

test('buildFontSupportProfile uses mixed stack for mixed scripts', () => {
  const profile = buildFontSupportProfile('Invoice номер 42');
  assert.deepEqual(profile.requiredScripts.sort(), ['cyrillic', 'latin']);
  assert.match(profile.recommendedSansSerifStack, /Noto Sans/);
});

test('buildFontSupportProfile uses latin stack for latin-only text', () => {
  const profile = buildFontSupportProfile('Only latin text for OCR output');
  assert.deepEqual(profile.requiredScripts, ['latin']);
  assert.match(profile.recommendedMonospaceStack, /JetBrains Mono/);
});
