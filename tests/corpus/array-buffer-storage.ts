const buffer = new ArrayBuffer(24);
const bytes = new Uint8Array(buffer);
const words = new Uint32Array(buffer, 4, 2);
const view = new DataView(buffer, 4, 8);
console.log(buffer.byteLength, buffer.maxByteLength, buffer.resizable, buffer.detached);
console.log(bytes.buffer === buffer, words.buffer === buffer, view.buffer === buffer);
view.setUint32(0, 0x12345678, true);
console.log(words[0], bytes[4], bytes[7], words.byteOffset, words.byteLength);
const tail = bytes.subarray(5, 9);
console.log(tail.buffer === buffer, tail.byteOffset, tail.length);
const shared = Buffer.from(buffer, 5, 3);
shared[0] = 99;
console.log(bytes[5], view.getUint8(1), shared.buffer === buffer);
const copy = buffer.slice(4, 8);
const copied = new Uint8Array(copy);
copied[0] = 7;
console.log(copy.byteLength, copy !== buffer, bytes[4], copied[0]);
const held: unknown = buffer;
console.log(held === buffer, held instanceof ArrayBuffer, bytes instanceof ArrayBuffer);
console.log(ArrayBuffer.isView(buffer), ArrayBuffer.isView(bytes), ArrayBuffer.isView(view));
const descriptor = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength")!;
const getter: unknown = descriptor.get;
console.log(descriptor.enumerable, descriptor.configurable, descriptor.set === undefined);
if (typeof getter === "function") {
  console.log(getter.name, getter.length, getter.call(buffer), getter.call(held));
  console.log(getter === Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength")!.get);
  try { getter.call(bytes); } catch (error) { if (error instanceof Error) console.log(error.name); }
}
try { new Uint32Array(buffer, 1); } catch (error) { if (error instanceof Error) console.log(error.name); }
try { new DataView(buffer, 25); } catch (error) { if (error instanceof Error) console.log(error.name); }
console.log(new ArrayBuffer(3.9).byteLength, new ArrayBuffer(NaN).byteLength);
try { new ArrayBuffer(-1); } catch (error) { if (error instanceof Error) console.log(error.name); }
