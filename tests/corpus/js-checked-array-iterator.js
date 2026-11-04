/** @param {unknown} value */
function checked(value) { return value; }
function iteratorOf(source) { return source[Symbol.iterator](); }
/** @type {number[]} */
const values = [1, 2];
const source = checked(values);
console.log(source[Symbol.iterator] === Array.prototype.values);
console.log(Symbol.iterator in source, Object.hasOwn(source, Symbol.iterator));
const iterator = iteratorOf(source);
console.log(iterator[Symbol.iterator]() === iterator);
console.log(iterator.next().value);
values.push(3);
console.log(iterator.next().value, iterator.next().value, iterator.next().done);
values.push(4);
console.log(iterator.next().done);
console.log(Array.from(source).join(","));
for (const value of source) {
  console.log("live", value);
  if (value === 1) values.push(5);
}
