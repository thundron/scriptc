const values = JSON.parse('[0,1,2,3,4]');
console.log(values.splice(1, 2, 8, 9).join(','), values.join(','));
console.log(values.splice(-2, 1).join(','), values.join(','));
console.log(values.splice(1, 0, 7).join(','), values.join(','));
console.log(values.splice(2).join(','), values.join(','));
console.log(values.splice(9, 2).join(','), values.join(','));

const nested = JSON.parse('[1,[2,[3,[4]]],5]');
console.log(JSON.stringify(nested.flat()));
console.log(JSON.stringify(nested.flat(2)));
console.log(JSON.stringify(nested.flat(0)));
console.log(JSON.stringify(nested));

const sealed = JSON.parse('[1,2,3]');
Object.seal(sealed);
console.log(sealed.splice(1, 1, 7).join(','), sealed.join(','));
try { sealed.splice(1, 1); } catch (error) { console.log(error.name); }
console.log(sealed.join(','));
