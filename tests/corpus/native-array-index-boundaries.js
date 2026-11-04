const values = JSON.parse('[4,2,4,1]');
console.log(values.indexOf(4), values.indexOf(4, 1), values.indexOf(4, -2));
console.log(values.lastIndexOf(4), values.lastIndexOf(4, 1), values.lastIndexOf(4, -3));
console.log(values.includes(4, 3), values.includes(4, -2), values.includes(4, Infinity));
console.log(values.findLast((value) => value > 1), values.findLastIndex((value) => value > 1));
console.log(values.findLast((value) => value > 9), values.findLastIndex((value) => value > 9));
console.log(values.slice(-3, -1).join(','), values.slice(99).join(','));
console.log(values.toReversed().join(','), values.join(','));
console.log(values.toSpliced(0, 0, 8).join(','), values.join(','));
console.log(values.with(-4, 7).join(','), values.join(','));

const shifted = JSON.parse('[1,2,3]');
console.log(shifted.unshift(8, 9), shifted.join(','));
console.log(shifted.unshift(), shifted.join(','));
console.log(shifted.splice(1, 2, 4, 5, 6).join(','), shifted.join(','));
console.log(shifted.splice(-1, 1, 7).join(','), shifted.join(','));

const copied = JSON.parse('[0,1,2,3,4]');
console.log(copied.copyWithin(1, 3).join(','));
console.log(copied.copyWithin(-2, 0, 2).join(','));
console.log(copied.fill(6, -3, -1).join(','));
console.log(copied.fill(7, 0, 0).join(','));

const nested = JSON.parse('[1,[2,[3]],4]');
console.log(nested.flat(0).join(','));
console.log(nested.flat(1).join(','));
console.log(nested.flat(2).join(','));
console.log(JSON.stringify(nested));
