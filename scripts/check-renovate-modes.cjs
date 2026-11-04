const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveModes } = require('./resolve-renovate-modes.cjs');

test('legacy callers select both modes by default', () => {
  assert.deepEqual(resolveModes(undefined), ['routine', 'security']);
  assert.deepEqual(resolveModes('both'), ['routine', 'security']);
});

test('scheduled routine run selects only routine updates', () => {
  assert.deepEqual(resolveModes('scheduled', '5 4 * * 1', '5 3 * * *', '5 4 * * 1'), ['routine']);
});

test('scheduled security run selects only security updates', () => {
  assert.deepEqual(resolveModes('scheduled', '5 3 * * *', '5 3 * * *', '5 4 * * 1'), ['security']);
});

test('manual mode can deliberately select routine, security, or both', () => {
  assert.deepEqual(resolveModes('routine'), ['routine']);
  assert.deepEqual(resolveModes('security'), ['security']);
  assert.deepEqual(resolveModes('both'), ['routine', 'security']);
});

test('unknown scheduled cron fails closed', () => {
  assert.throws(() => resolveModes('scheduled', '5 2 * * *', '5 3 * * *', '5 4 * * 1'), /not a configured Renovate schedule/);
});

test('duplicate schedule identities fail closed', () => {
  assert.throws(() => resolveModes('scheduled', '5 4 * * 1', '5 4 * * 1', '5 4 * * 1'), /configured and distinct/);
});

test('unsupported manual mode fails closed', () => {
  assert.throws(() => resolveModes('weekly'), /must be routine, security, or both/);
});
