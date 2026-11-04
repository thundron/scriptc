const Make = Array;
const empty = new Make(3);
console.log(empty.length, 0 in empty, empty[0], Object.keys(empty).join(','), Object.getOwnPropertyNames(empty).join(','));
empty[1] = undefined;
console.log(1 in empty, Object.hasOwn(empty, '0'), Object.hasOwn(empty, '1'), Object.getOwnPropertyDescriptor(empty, '0') === undefined);
let calls = 0;
const mapped = empty.map((value, index) => { calls++; return index; });
console.log(calls, mapped.length, 0 in mapped, 1 in mapped, mapped.join(','));
console.log(empty.slice().length, Object.keys(empty.concat([4])).join(','), empty.flat().length);
console.log(new Make('3').join(','), new Make(1, 2).join(','), Make(2).length);
console.log([...empty].length, [...empty].every(value => value === undefined));
empty.fill(2);
console.log(empty.join(','), empty.reduce((sum, value) => sum + value, 0));
delete empty[1];
console.log(empty.length, 1 in empty, empty.map(value => value).join(','));
const cloned = structuredClone(empty);
console.log(cloned.length, 1 in cloned, Object.keys(cloned).join(','));
const sealed = new Make(2);
Object.preventExtensions(sealed);
sealed.length = 3;
try { sealed[1] = 4; } catch (error) { console.log(error.name); }
console.log(sealed.length, 1 in sealed);
for (const length of [-1, 1.5, Infinity, 4294967296]) {
  try { new Make(length); } catch (error) { console.log(error.name, error.message); }
}
const partlySealed = new Array(4);
partlySealed[1] = 9;
Object.seal(partlySealed);
try { partlySealed.length = 0; } catch (error) { console.log(error.name); }
console.log(partlySealed.length, Object.keys(partlySealed).join(','));
const sparseCopy = new Array(3);
sparseCopy[1] = 7;
for (const copy of [sparseCopy.toReversed(), sparseCopy.toSorted(), sparseCopy.with(1, 8), sparseCopy.toSpliced()]) {
  console.log(copy.length, Object.keys(copy).join(','), copy.join(','));
}
const numbers = new Array(0, 1);
numbers[4294967294] = 2;
numbers[4294967295] = 3;
console.log(numbers.length, numbers.indexOf(2, 4294967290), numbers.indexOf(3, 4294967290), numbers[4294967295]);
