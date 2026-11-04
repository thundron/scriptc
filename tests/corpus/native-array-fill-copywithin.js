const values = JSON.parse('[1,2,3,4,5]');
console.log(values.fill(8, 1, -1) === values, values.join(','));
console.log(values.copyWithin(2, 0, 3) === values, values.join(','));
console.log(values.copyWithin(0, 2, 5).join(','));
console.log(values.copyWithin(-2, 0, 2).join(','));

const frozen = JSON.parse('[1,2,3]');
Object.freeze(frozen);
try { frozen.fill(9); } catch (error) { console.log(error.name); }
try { frozen.copyWithin(1, 0); } catch (error) { console.log(error.name); }
console.log(frozen.join(','));

const sealed = JSON.parse('[1,2,3]');
Object.seal(sealed);
sealed.fill(7, 1);
sealed.copyWithin(0, 1);
console.log(sealed.join(','));
