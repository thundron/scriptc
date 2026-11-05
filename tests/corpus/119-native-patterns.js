'use strict';
const collect = function (items) {
  const iterator = items[Symbol.iterator]();
  const result = [];
  for (;;) {
    const next = iterator.next();
    if (next.done) return result;
    result.push(next.value);
  }
};
console.log(JSON.stringify(collect([1, 2, 3])));
console.log(JSON.stringify([1, 2].flatMap((value) => [value, value + 10])));
console.log(JSON.stringify(JSON.parse("[1,2]").flatMap((value) => [value, value + 10])));
const adapt = ([value]) => value;
const stored = adapt;
console.log(stored(['kept', 'surplus'], 'extra'));
function errorBase() {
  return class extends Error {
    constructor(value) { super(value.message); this.reason = value.reason; }
  };
}
class Failure extends errorBase() {}
const failure = new Failure({ message: 'broken', reason: 'test' });
console.log(failure.message, failure.reason, failure instanceof Error);
