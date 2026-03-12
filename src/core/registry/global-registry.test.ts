import assert from 'node:assert/strict';
import test from 'node:test';
import type { IToolDefinition } from '../types/contracts';
import { GlobalRegistry } from './global-registry';

const stubTool: IToolDefinition = {
  id: 'stub-tool',
  name: 'Stub Tool',
  description: 'Stub',
  uiLoader: async () => ({ default: () => null }),
  logicLoader: async () => ({ run: async ({ inputIds }) => ({ outputIds: inputIds }) }),
};

test('GlobalRegistry registers and returns tool definitions', () => {
  const registry = new GlobalRegistry();
  registry.register(stubTool);

  const loaded = registry.get(stubTool.id);
  assert.equal(loaded.id, stubTool.id);
  assert.equal(registry.list().length, 1);
});

test('GlobalRegistry rejects duplicate tool registration', () => {
  const registry = new GlobalRegistry();
  registry.register(stubTool);
  assert.throws(() => registry.register(stubTool), /already registered/);
});
