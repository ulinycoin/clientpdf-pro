import assert from 'node:assert/strict';
import test from 'node:test';
import { formatEvent } from './telemetry-panel';

test('formatEvent renders STUDIO_EDIT_SAVE_ACTION with key metrics', () => {
  const text = formatEvent({
    type: 'STUDIO_EDIT_SAVE_ACTION',
    runId: 'run-1',
    toolId: 'studio.edit.text',
    action: 'apply',
    scope: 'selection',
    pagesTotal: 3,
    pagesSucceeded: 2,
    pagesFailed: 1,
    overflowCount: 1,
    message: 'partial',
  });

  assert.match(text, /STUDIO_EDIT_SAVE_ACTION/);
  assert.match(text, /action=apply/);
  assert.match(text, /scope=selection/);
  assert.match(text, /ok=2\/3/);
  assert.match(text, /failed=1/);
  assert.match(text, /overflow=1/);
  assert.match(text, /msg=partial/);
});

