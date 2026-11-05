const record = { 0: 2, 1: 4, 2: 6, length: 3 };
console.log(Array.prototype.findLast.call(record, value => value < 6));
console.log(Array.prototype.findLastIndex.call(record, value => value < 6));
console.log(Array.prototype.findLast.call(record, value => value > 9));
console.log(Array.prototype.findLastIndex.call(record, value => value > 9));

const sparse = { 0: 1, 2: 3, length: 3 };
const seen = [];
console.log(Array.prototype.findLastIndex.call(sparse, (value, index) => {
  seen.push(`${index}:${value}`);
  return value === undefined;
}));
console.log(seen.join(','));
