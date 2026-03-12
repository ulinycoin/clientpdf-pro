import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalRegistry } from '../../core/registry/global-registry';
import type { IToolDefinition } from '../../core/types/contracts';
import { buildToolMenu } from './build-tool-menu';

const tool: IToolDefinition = {
  id: 'ocr-pdf',
  name: 'OCR PDF',
  description: 'ocr',
  entitlements: ['pdf.ocr'],
  limits: { featureTier: 'pro' },
  uiLoader: async () => ({ default: () => null }),
  logicLoader: async () => ({ run: async ({ inputIds }) => ({ outputIds: inputIds }) }),
};

test('buildToolMenu derives menu metadata from registry', () => {
  const registry = new GlobalRegistry();
  registry.register(tool);
  const menu = buildToolMenu(registry);

  assert.equal(menu.length, 1);
  assert.equal(menu[0].toolId, 'ocr-pdf');
  assert.equal(menu[0].href, '/ocr-pdf');
  assert.equal(menu[0].requiresPro, true);
  assert.deepEqual(menu[0].requiredEntitlements, ['pdf.ocr']);
});

test('buildToolMenu hides tools that are Studio-only in standalone navigation', () => {
  const registry = new GlobalRegistry();
  registry.register({
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'rotate',
    uiLoader: async () => ({ default: () => null }),
    logicLoader: async () => ({ run: async ({ inputIds }) => ({ outputIds: inputIds }) }),
  });

  const menu = buildToolMenu(registry);
  assert.equal(menu.length, 0);
});
