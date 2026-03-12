import test from 'node:test';
import assert from 'node:assert/strict';
import { getStudioToolCategory, groupToolsByStudioCategory } from './tool-categories';
import type { ToolMenuItem } from './build-tool-menu';

test('getStudioToolCategory maps known Edit and Convert tools', () => {
  assert.equal(getStudioToolCategory('merge-pdf'), 'edit');
  assert.equal(getStudioToolCategory('compress-pdf'), 'edit');
  assert.equal(getStudioToolCategory('word-to-pdf'), 'convert');
  assert.equal(getStudioToolCategory('ocr-pdf'), 'convert');
  assert.equal(getStudioToolCategory('extract-images'), 'convert');
});

test('getStudioToolCategory returns null for unknown tools', () => {
  assert.equal(getStudioToolCategory('unknown-tool'), null);
});

test('groupToolsByStudioCategory groups only categorized tools preserving order', () => {
  const menu: ToolMenuItem[] = [
    { toolId: 'word-to-pdf', label: 'Word to PDF', href: '/word-to-pdf', requiredEntitlements: [], requiresPro: false },
    { toolId: 'merge-pdf', label: 'Merge', href: '/merge-pdf', requiredEntitlements: [], requiresPro: false },
    { toolId: 'ocr-pdf', label: 'OCR', href: '/ocr-pdf', requiredEntitlements: [], requiresPro: false },
    { toolId: 'extract-images', label: 'Extract Images', href: '/extract-images', requiredEntitlements: [], requiresPro: false },
    { toolId: 'unknown-tool', label: 'Unknown', href: '/unknown-tool', requiredEntitlements: [], requiresPro: false },
  ];

  const grouped = groupToolsByStudioCategory(menu);

  assert.deepEqual(grouped.edit.map((item) => item.toolId), ['merge-pdf']);
  assert.deepEqual(grouped.convert.map((item) => item.toolId), ['word-to-pdf', 'ocr-pdf', 'extract-images']);
});
