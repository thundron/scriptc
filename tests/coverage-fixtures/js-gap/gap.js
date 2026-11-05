// noImplicitAny is off in this directory. Inferred JavaScript and the
// neighboring JSDoc-typed function both compile as native code, including
// when the optional island engine is enabled.
'use strict';

function untyped(x) {
  return x * 2;
}

/** @param {number} n */
function typed(n) {
  return n * 3;
}

console.log(`${untyped(21)}`);
console.log(typed(14));
