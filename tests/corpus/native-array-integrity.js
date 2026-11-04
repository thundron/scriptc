const sealed = JSON.parse('[1,2]');
Object.seal(sealed);
console.log(Object.isExtensible(sealed), Object.isSealed(sealed), Object.isFrozen(sealed));
console.log(Object.getOwnPropertyDescriptor(sealed, '0').configurable);
console.log(Object.getOwnPropertyDescriptor(sealed, '0').writable);
sealed[0] = 4;
console.log(sealed[0]);
for (const operation of [() => sealed.pop(), () => sealed.shift(), () => sealed.push(3)]) {
  try { operation(); } catch (error) { console.log(error.name); }
}
console.log(sealed.join(','));

const frozen = JSON.parse('[3,5]');
Object.freeze(frozen);
console.log(Object.isSealed(frozen), Object.isFrozen(frozen));
console.log(Object.getOwnPropertyDescriptor(frozen, '0').writable);
console.log(Object.getOwnPropertyDescriptor(frozen, 'length').writable);
for (const operation of [() => { frozen[0] = 9; }, () => frozen.reverse(), () => frozen.sort()]) {
  try { operation(); } catch (error) { console.log(error.name); }
}
console.log(frozen.join(','));

const empty = JSON.parse('[]');
Object.preventExtensions(empty);
console.log(Object.isSealed(empty), Object.isFrozen(empty));
try { empty.push(1); } catch (error) { console.log(error.name); }
console.log(empty.length);
