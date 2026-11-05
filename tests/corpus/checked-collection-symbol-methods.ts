const values = new Set([20, 22]);
const iterator = values[Symbol.iterator]();
console.log(iterator.next().value, iterator.next().value, iterator.next().done);
const entries = new Map([["answer", 42]]);
const first = entries[Symbol.iterator]().next();
console.log(first.done, first.value?.[0], first.value?.[1]);
