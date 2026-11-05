import assert from 'node:assert/strict';

function throwValue(value) { throw value; }
function same(actual, expected) { assert.strictEqual(actual, expected); }
function relay(value) {
  try { throwValue(value); }
  catch (error) {
    console.log('inner', error instanceof Error, error instanceof TypeError);
    throw error;
  }
}
const failure = new TypeError('renderer initialization');
function check(value) {
  try { relay(value); }
  catch (error) {
    assert.strictEqual(error, value);
    console.log('outer', error instanceof Error, error instanceof TypeError, error instanceof RangeError);
    if (error instanceof Error) console.log(error.name, error.message);
  }
}
check(failure);
check(new RangeError('bounds'));
check({ name: 'TypeError', message: 'ordinary object', '%error': true });
function reject(value) { return Promise.reject(value); }
try { await reject(failure); }
catch (error) {
  same(error, failure);
  console.log('rejection', error instanceof Error, error instanceof TypeError);
  if (error instanceof Error) console.log(error.message);
}
