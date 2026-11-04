const values = JSON.parse('[4,1,3,2]');
console.log(values.toReversed().join(','), values.join(','));
console.log(values.toSorted().join(','), values.join(','));
console.log(values.toSorted((a, b) => b - a).join(','));
console.log(values.toSpliced(1, 2, 8, 9).join(','), values.join(','));
console.log(values.toSpliced(-2, 1).join(','));
console.log(values.with(-1, 7).join(','), values.join(','));
try { values.with(9, 0); } catch (error) { console.log(error.name); }

Object.freeze(values);
console.log(values.toReversed().join(','));
console.log(values.toSorted().join(','));
console.log(values.toSpliced(0, 1, 6).join(','));
console.log(values.with(0, 5).join(','));
console.log(values.join(','));
