import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePricing, example, validateDecision, validatePricing } from '../lib/pricing.mjs';

test('synthetic Site pilot matches the packet', () => {
  const { value, errors } = validatePricing(example);
  assert.deepEqual(errors, []);
  const result = calculatePricing(value);
  assert.equal(result.laborValue, 5000);
  assert.equal(result.balance, -44000);
  assert.equal(result.ratio.toFixed(2), '0.10');
});

test('first-month costs, recurring costs and provider costs are independent', () => {
  const result = calculatePricing({
    ...example, coordRate: 100, setupMinutes: 30, oneTimeCharges: 200, recurringCharges: 20,
    otherBenefit: 35, providerMinutes: 45, providerRate: 80, providerCosts: 10,
  });
  assert.equal(result.laborValue, 12500);
  assert.equal(result.cost, 76000);
  assert.equal(result.recurringCost, 51000);
  assert.equal(result.balance, -60000);
  assert.equal(result.recurringBalance, -35000);
  assert.equal(result.providerCost, 7000);
  assert.equal(result.providerContribution, 42000);
});

test('ratios distinguish break-even, course target and zero buyer cost', () => {
  assert.equal(calculatePricing({ ...example, otherBenefit: 440 }).ratio, 1);
  assert.equal(calculatePricing({ ...example, otherBenefit: 4850 }).ratio, 10);
  assert.equal(calculatePricing({ ...example, plan: 'free' }).ratio, null);
});

test('invalid input never becomes an implicit zero', () => {
  for (const [key, bad] of Object.entries({
    cases: 26, adminBaseline: -1, adminRate: '', coordRate: null, period: '2026-19',
    coordPlan: '1e3', providerRate: 10.001, plan: 'constructor', otherBenefit: 1,
  })) assert.ok(validatePricing({ ...example, [key]: bad }).errors.length, key);
});

test('buyer decision signals validate dates and preserve their source', () => {
  const payment = { kind: 'payment', date: '2026-11-14', source: 'receipt' };
  assert.deepEqual(validateDecision(payment), payment);
  assert.equal(validateDecision({ ...payment, date: '2026-02-30' }), null);
  assert.equal(validateDecision({ ...payment, kind: 'close_case' }), null);
});
