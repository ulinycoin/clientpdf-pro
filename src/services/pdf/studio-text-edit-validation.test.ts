import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeAndValidateStudioEditRequest } from './studio-text-edit-validation';

test('normalizeAndValidateStudioEditRequest defaults advanced text formatting fields', () => {
  const result = normalizeAndValidateStudioEditRequest({
    pageIndex: 0,
    elements: [{
      id: 't-1',
      type: 'text',
      x: 0.1,
      y: 0.2,
      w: 0.3,
      h: 0.1,
      text: 'Hello',
      color: '#112233',
      fontSize: 16,
      fontFamily: 'sora',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      opacity: 1,
    }],
  });

  const textElement = result.elements[0];
  assert.equal(textElement.type, 'text');
  if (textElement.type === 'text') {
    assert.equal(textElement.lineHeight, 1.2);
    assert.equal(textElement.letterSpacing, 0);
  }
});

test('normalizeAndValidateStudioEditRequest clamps advanced text formatting fields', () => {
  const result = normalizeAndValidateStudioEditRequest({
    pageIndex: 0,
    elements: [{
      id: 't-2',
      type: 'text',
      x: 0.1,
      y: 0.2,
      w: 0.3,
      h: 0.1,
      text: 'Clamp',
      color: '#112233',
      fontSize: 16,
      fontFamily: 'sora',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 9,
      letterSpacing: -10,
      opacity: 1,
    }],
  });

  const textElement = result.elements[0];
  assert.equal(textElement.type, 'text');
  if (textElement.type === 'text') {
    assert.equal(textElement.lineHeight, 3);
    assert.equal(textElement.letterSpacing, -2);
  }
});

test('normalizeAndValidateStudioEditRequest preserves optional source text style hints', () => {
  const result = normalizeAndValidateStudioEditRequest({
    pageIndex: 0,
    elements: [{
      id: 't-source',
      type: 'text',
      x: 0.1,
      y: 0.2,
      w: 0.3,
      h: 0.1,
      text: 'Source style',
      color: '#112233',
      fontSize: 16,
      fontFamily: 'sora',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      opacity: 1,
      sourceFontName: 'ABCDEE+Times-Bold',
      sourceFontFamilyHint: 'Times New Roman',
      sourceFontSizeRatio: 0.031,
    }],
  });

  const textElement = result.elements[0];
  assert.equal(textElement.type, 'text');
  if (textElement.type === 'text') {
    assert.equal(textElement.sourceFontName, 'ABCDEE+Times-Bold');
    assert.equal(textElement.sourceFontFamilyHint, 'Times New Roman');
    assert.equal(textElement.sourceFontSizeRatio, 0.031);
  }
});

test('normalizeAndValidateStudioEditRequest accepts extended font families', () => {
  const result = normalizeAndValidateStudioEditRequest({
    pageIndex: 0,
    elements: [{
      id: 't-fonts',
      type: 'text',
      x: 0.1,
      y: 0.2,
      w: 0.3,
      h: 0.1,
      text: 'Fonts',
      color: '#112233',
      fontSize: 16,
      fontFamily: 'noto-arabic',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      opacity: 1,
    }],
  });

  const textElement = result.elements[0];
  assert.equal(textElement.type, 'text');
  if (textElement.type === 'text') {
    assert.equal(textElement.fontFamily, 'noto-arabic');
  }
});

test('normalizeAndValidateStudioEditRequest accepts form-field elements', () => {
  const result = normalizeAndValidateStudioEditRequest({
    pageIndex: 1,
    elements: [{
      id: 'f-1',
      type: 'form-field',
      formType: 'checkbox',
      name: 'accept_terms',
      x: 0.12,
      y: 0.22,
      w: 0.2,
      h: 0.08,
      defaultValue: 'On',
      required: true,
      fontSize: 12,
      opacity: 0.9,
    }],
  });

  assert.equal(result.pageIndex, 1);
  assert.equal(result.elements.length, 1);
  const field = result.elements[0];
  assert.equal(field.type, 'form-field');
  if (field.type === 'form-field') {
    assert.equal(field.formType, 'checkbox');
    assert.equal(field.name, 'accept_terms');
    assert.equal(field.required, true);
    assert.equal(field.defaultValue, 'On');
    assert.equal(field.opacity, 0.9);
  }
});

test('normalizeAndValidateStudioEditRequest normalizes dropdown options for form fields', () => {
  const result = normalizeAndValidateStudioEditRequest({
    pageIndex: 0,
    elements: [{
      id: 'f-2',
      type: 'form-field',
      formType: 'dropdown',
      x: 0.1,
      y: 0.2,
      w: 0.3,
      h: 0.06,
      defaultValue: 'B',
      options: ['A', ' ', 'B', 42 as unknown as string],
      required: false,
      fontSize: 11,
      opacity: 1,
    }],
  });

  const field = result.elements[0];
  assert.equal(field.type, 'form-field');
  if (field.type === 'form-field') {
    assert.equal(field.formType, 'dropdown');
    assert.deepEqual(field.options, ['A', 'B']);
  }
});

test('normalizeAndValidateStudioEditRequest accepts watermark elements', () => {
  const result = normalizeAndValidateStudioEditRequest({
    pageIndex: 0,
    elements: [{
      id: 'wm-1',
      type: 'watermark',
      x: 0.1,
      y: 0.2,
      w: 0.3,
      h: 0.07,
      text: 'CONFIDENTIAL',
      color: '#778899',
      fontSize: 28,
      fontFamily: 'sora',
      fontWeight: 'bold',
      fontStyle: 'normal',
      opacity: 0.2,
      rotation: -32,
      repeatEnabled: true,
      repeatCols: 4,
      repeatRows: 3,
      repeatGapX: 0.12,
      repeatGapY: 0.1,
    }],
  });

  const element = result.elements[0];
  assert.equal(element.type, 'watermark');
  if (element.type === 'watermark') {
    assert.equal(element.text, 'CONFIDENTIAL');
    assert.equal(element.repeatEnabled, true);
    assert.equal(element.repeatCols, 4);
    assert.equal(element.repeatRows, 3);
    assert.equal(element.rotation, -32);
  }
});
