import assert from 'node:assert/strict';
import test from 'node:test';
import { bootstrapPlatform } from './bootstrap';
import { mergePdfDefinition } from '../../plugins/merge-pdf/definition';

test('bootstrapPlatform returns non-empty registry-derived routes and menu', () => {
  const boot = bootstrapPlatform('in-process', [mergePdfDefinition]);
  assert.ok(boot.routes.length >= 1);
  assert.ok(boot.menu.length >= 1);
  assert.equal(boot.routes.length, boot.menu.length);
});
