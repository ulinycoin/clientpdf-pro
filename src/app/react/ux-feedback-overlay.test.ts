import { strict as assert } from 'node:assert';
import test from 'node:test';
import { shouldDisplayToast, toToastKey } from './ux-feedback-overlay';

test('toToastKey normalizes message and includes tool/level', () => {
  const keyA = toToastKey('merge-pdf', 'error', ' Broken PDF ');
  const keyB = toToastKey('merge-pdf', 'error', 'broken pdf');
  assert.equal(keyA, keyB);
});

test('shouldDisplayToast deduplicates within window and allows after timeout', () => {
  const now = 10_000;
  assert.equal(shouldDisplayToast(undefined, now), true);
  assert.equal(shouldDisplayToast(8_500, now, 2_000), false);
  assert.equal(shouldDisplayToast(7_500, now, 2_000), true);
});
