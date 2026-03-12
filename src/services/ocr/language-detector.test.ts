import assert from 'node:assert/strict';
import test from 'node:test';
import { detectDocumentLanguage, selectAutoOcrLanguagePack } from './language-detector';

test('detectDocumentLanguage identifies English text', () => {
  const result = detectDocumentLanguage('This is a sample invoice and the payment is due for the customer.');
  assert.equal(result.primaryLanguage, 'eng');
  assert.equal(result.dominantScript, 'latin');
  assert.ok(result.confidence > 0);
});

test('detectDocumentLanguage identifies Cyrillic text', () => {
  const result = detectDocumentLanguage('Это тестовый документ и в нем есть данные для проверки текста.');
  assert.equal(result.primaryLanguage, 'rus');
  assert.equal(result.dominantScript, 'cyrillic');
});

test('selectAutoOcrLanguagePack returns combined pack for close candidates', () => {
  const detection = detectDocumentLanguage('і це документ і дані для перевірки та тексту');
  const pack = selectAutoOcrLanguagePack(detection);
  assert.match(pack, /ukr/);
});

test('detectDocumentLanguage identifies Japanese text', () => {
  const result = detectDocumentLanguage('これは日本語のテキストです。請求書の合計金額を確認してください。');
  assert.equal(result.primaryLanguage, 'jpn');
  assert.equal(result.dominantScript, 'japanese');
});

test('detectDocumentLanguage identifies Hindi text', () => {
  const result = detectDocumentLanguage('यह हिंदी दस्तावेज़ का नमूना है और इसमें भुगतान की जानकारी है।');
  assert.equal(result.primaryLanguage, 'hin');
  assert.equal(result.dominantScript, 'devanagari');
});

test('detectDocumentLanguage identifies Arabic text', () => {
  const result = detectDocumentLanguage('هذا نص عربي ومثال على الفاتورة التي يجب على العميل دفعها في الوقت المحدد.');
  assert.equal(result.primaryLanguage, 'ara');
  assert.equal(result.dominantScript, 'arabic');
});
