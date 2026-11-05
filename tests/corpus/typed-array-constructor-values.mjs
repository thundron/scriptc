function callWithoutNew(value) { return value(1); }
const constructors = [Uint8Array, Uint8ClampedArray, Int8Array, Uint16Array, Int16Array, Uint32Array, Int32Array, Float32Array, Float64Array];
for (const C of constructors) {
  const value = new C([1, 257.5, -2]);
  const Saved = value.constructor;
  const copy = new Saved(value);
  copy[0] = 8;
  console.log(typeof C, C.name, C.length, C.BYTES_PER_ELEMENT, C === Saved, value[0], copy[0], copy[1], copy[2]);
  const view = new Saved(value.buffer, value.byteOffset, value.length);
  view[0] = 9;
  console.log(view.buffer === value.buffer, value[0], new Saved().length, new Saved(2).length);
  const descriptor = Object.getOwnPropertyDescriptor(C, 'BYTES_PER_ELEMENT');
  console.log(descriptor.value, descriptor.writable, descriptor.enumerable, descriptor.configurable);
  try { new Saved(-1); } catch (error) { console.log(error.name); }
  try { callWithoutNew(C); } catch (error) { console.log(error.name, error.message); }
}
class Writer {
  /** @param {number[]} [output=[]] @returns {number[]} */
  write(output = []) { output[0] = 257.5; output[1] = -2; return output; }
}
const writer = new Writer();
const target = new Uint8Array(2);
console.log(writer.write(target) === target, target[0], target[1], writer.write().length);
let trace = '';
function constructor() { trace += 'constructor '; return Float32Array; }
function argument() { trace += 'argument '; return 2; }
const made = new (constructor())(argument());
console.log(made.length, trace);
