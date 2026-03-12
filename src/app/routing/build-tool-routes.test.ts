import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalRegistry } from '../../core/registry/global-registry';
import type { IToolDefinition } from '../../core/types/contracts';
import { buildToolRoutes } from './build-tool-routes';

const tool: IToolDefinition = {
  id: 'merge-pdf',
  name: 'Merge PDF',
  description: 'merge',
  uiLoader: async () => ({ default: () => null }),
  logicLoader: async () => ({ run: async ({ inputIds }) => ({ outputIds: inputIds }) }),
};

test('buildToolRoutes derives routes from registry', () => {
  const registry = new GlobalRegistry();
  registry.register(tool);
  const routes = buildToolRoutes(registry);

  assert.equal(routes.length, 1);
  assert.equal(routes[0].toolId, 'merge-pdf');
  assert.equal(routes[0].path, '/merge-pdf');
  assert.equal(routes[0].title, 'Merge PDF');
});

test('buildToolRoutes hides Studio-only standalone routes', () => {
  const registry = new GlobalRegistry();
  registry.register({
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'split',
    uiLoader: async () => ({ default: () => null }),
    logicLoader: async () => ({ run: async ({ inputIds }) => ({ outputIds: inputIds }) }),
  });

  const routes = buildToolRoutes(registry);
  assert.equal(routes.length, 0);
});
