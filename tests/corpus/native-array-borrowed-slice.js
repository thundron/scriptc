const arrayLike = { 0: 'a', 1: 'b', 2: 'c', 3: 'd', length: 4 };
console.log(Array.prototype.slice.call(arrayLike).join(','));
console.log(Array.prototype.slice.call(arrayLike, 1, 3).join(','));
console.log(Array.prototype.slice.call(arrayLike, -2).join(','));
console.log(Array.prototype.slice.call(arrayLike, 0, -1).join(','));
console.log(Array.prototype.slice.call(arrayLike, 8).length);
console.log(Array.prototype.slice.call(arrayLike, -9, 2).join(','));
console.log(Array.prototype.slice.call(arrayLike, 3, 1).length);
console.log(Array.prototype.slice.call(arrayLike, 1, undefined).join(','));

const values = JSON.parse('[1,2,3,4]');
console.log(Array.prototype.slice.call(values, -3, -1).join(','));
console.log(values.join(','));
