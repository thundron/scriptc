const arrayLike = { 0: 'a', 1: 'b', 2: 'a', length: 3 };
console.log(Array.prototype.indexOf.call(arrayLike, 'a'));
console.log(Array.prototype.indexOf.call(arrayLike, 'a', 1));
console.log(Array.prototype.lastIndexOf.call(arrayLike, 'a'));
console.log(Array.prototype.lastIndexOf.call(arrayLike, 'a', -2));
console.log(Array.prototype.includes.call(arrayLike, 'b'));
console.log(Array.prototype.at.call(arrayLike, -1));
console.log(Array.prototype.indexOf.call('aba', 'b'));
console.log(Array.prototype.includes.call('aba', 'z'));
try { Array.prototype.indexOf.call(null, 'a'); } catch (error) { console.log(error.name); }

const numbers = { 0: 2, 1: 3, 2: 2, length: 3 };
console.log(Array.prototype.map.call(numbers, (value) => value * 2).join(','));
console.log(Array.prototype.filter.call(numbers, (value) => value > 2).join(','));
console.log(Array.prototype.some.call(numbers, (value) => value === 3));
console.log(Array.prototype.every.call(numbers, (value) => value > 1));
console.log(Array.prototype.find.call(numbers, (value) => value === 3));
console.log(Array.prototype.findIndex.call(numbers, (value) => value === 3));
let sum = 0;
Array.prototype.forEach.call(numbers, (value) => { sum += value; });
console.log(sum);
console.log(Array.prototype.reduce.call(numbers, (acc, value) => acc + value, 0));
console.log(Array.prototype.reduceRight.call(numbers, (acc, value) => acc * 10 + value, 0));

console.log(Array.prototype.indexOf.call({ 0: true, length: 'Infinity' }, true));
console.log(Array.prototype.lastIndexOf.call({ 4294967295: 'last', length: 4294967296 }, 'last'));
console.log(Array.prototype.some.call({ 0: 11, length: 'Infinity' }, (value) => value > 10));
console.log(Array.prototype.every.call({ 0: 9, length: Infinity }, (value) => value > 10));
console.log(Array.prototype.every.call({ 0: 11, length: 1 }, function () { return this.valueOf() === 5; }, 5));
console.log(Array.prototype.some.call({ 0: 11, length: 1 }, function () { return this.valueOf() === 'yes'; }, 'yes'));
let booleanReceiver;
Array.prototype.forEach.call({ 0: 11, length: 1 }, function () { booleanReceiver = this.valueOf(); }, false);
console.log(booleanReceiver);

const marker = {};
const sparseBorrow = { 5: marker, length: 100 };
console.log(Array.prototype.some.call(sparseBorrow, (value, index) => index === 5 && value === marker));
const filteredBorrow = Array.prototype.filter.call(sparseBorrow, (value, index) => index === 5 && value === marker);
console.log(filteredBorrow.length);
console.log(filteredBorrow[0] === marker);
console.log(Array.prototype.indexOf.call({ 0: marker, length: 1 }, marker));
console.log(Array.prototype.indexOf.call({ 0: marker, length: 1 }, {}));
console.log(Array.prototype.lastIndexOf.call({ 0: marker, 4294967295: marker, length: 4294967296 }, marker));

let fromIndexConversions = 0;
const unusedFromIndex = { valueOf() { fromIndexConversions++; return 1; } };
console.log(Array.prototype.indexOf.call({ length: 0 }, 'a', unusedFromIndex));
console.log(Array.prototype.lastIndexOf.call({ length: 0 }, 'a', unusedFromIndex));
console.log(Array.prototype.includes.call({ length: 0 }, 'a', unusedFromIndex));
console.log(fromIndexConversions);

let visits = 0;
console.log(Array.prototype.findIndex.call({ length: 2 }, (value, index) => { visits++; return index === 1 && value === undefined; }));
console.log(visits);
visits = 0;
console.log(Array.prototype.find.call({ length: 2 }, (value, index) => { visits++; return index === 1 && value === undefined; }));
console.log(visits);

let presenceChecks = 0;
const proxiedArrayLike = new Proxy({ 0: 'proxy', length: 1 }, {
  has() { presenceChecks++; return true; },
  get(target, key) { return target[key]; },
});
console.log(Array.prototype.find.call(proxiedArrayLike, (value) => value === 'proxy'));
console.log(Array.prototype.findIndex.call(proxiedArrayLike, (value) => value === 'proxy'));
console.log(presenceChecks);
console.log(Array.prototype.includes.call(proxiedArrayLike, 'proxy'));
console.log(presenceChecks);
console.log(Array.prototype.indexOf.call(proxiedArrayLike, 'proxy'));
console.log(presenceChecks);
