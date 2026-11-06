import {allocateShared, shared, sharedReadOnly, releaseShared, min4, max4} from '@scriptc/experimental/f32';
const handle = allocateShared(8);
const writable = shared(handle);
writable.set([1, -0, NaN, 4, 5, 6, 7, 8]);
const input = sharedReadOnly(handle);
const part = input.subarray(1, 5);
const viewOf = sharedReadOnly;
const other = viewOf(handle);
type Input = Readonly<Float32Array>;
const annotated: Input = other;
function aliasSame(values: Input): boolean { return values.buffer === input.buffer; }
console.log(annotated.buffer === input.buffer, aliasSame(input));
const output = new Float32Array(8);
min4(output, 0, input, 0, part, 0);
max4(output, 4, input, 4, other, 4);
console.log(input.buffer === writable.buffer, part.buffer === writable.buffer, other.buffer === input.buffer);
for (const value of output) console.log(Object.is(value, -0) ? '-0' : String(value));
console.log(input.length, input[0], part[0], typeof input[88]);
releaseShared(handle);
console.log(input[4], other[7], part.length);
try { sharedReadOnly(handle); } catch (error) { console.log(error instanceof RangeError); }
