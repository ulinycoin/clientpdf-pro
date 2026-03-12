import { strict as assert } from 'node:assert';
import test from 'node:test';
import { resolveBillingDestination } from './billing';

test('resolveBillingDestination falls back to /pricing for empty values', () => {
  assert.equal(resolveBillingDestination(undefined), '/pricing');
  assert.equal(resolveBillingDestination(''), '/pricing');
  assert.equal(resolveBillingDestination('   '), '/pricing');
});

test('resolveBillingDestination keeps configured destination', () => {
  assert.equal(resolveBillingDestination('/upgrade'), '/upgrade');
  assert.equal(resolveBillingDestination('https://billing.localpdf.com/checkout'), 'https://billing.localpdf.com/checkout');
});
