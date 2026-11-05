import { inspect } from "node:util";

function describe(value: unknown): void {
  console.log(value instanceof Int8Array, value instanceof Uint8Array, value instanceof Uint8ClampedArray,
    value instanceof Uint16Array, value instanceof Int16Array, value instanceof Uint32Array,
    value instanceof Int32Array, value instanceof Float32Array, value instanceof Float64Array);
  console.log(String(value), JSON.stringify(value), inspect(value));
  console.log(Object.prototype.toString.call(value));
}
describe(new Int8Array([-129, 255]));
describe(new Uint8Array([255, 256]));
describe(new Uint8ClampedArray([2.5, 3.5]));
describe(new Uint16Array([65535, 65536]));
describe(new Int16Array([32768, 65535]));
describe(new Uint32Array([4294967295, 4294967296]));
describe(new Int32Array([2147483648, 4294967295]));
describe(new Float32Array([1.25, NaN, Infinity, -0]));
describe(new Float64Array([1.25, NaN, -Infinity, -0]));
describe(Buffer.from([1, 2]));
describe(null);

const source = new Uint16Array([65535, 32768]);
const unknownView: unknown = source;
const restored = unknownView as Uint16Array;
restored[0] = 1234;
console.log(source === restored, source[0]);
if (unknownView instanceof Uint16Array) console.log(unknownView[1], unknownView.byteLength);
const nested: Record<string, unknown> = { words: source, floats: new Float64Array([1.5]) };
console.log((nested.words as Uint16Array) === source, String(nested.floats));
const shape = { words: new Int16Array([-1, 2]), nested: [new Float64Array([1.5, 2.5])] };
const opaque: unknown = shape;
const recovered = opaque as { words: Int16Array; nested: Float64Array[] };
console.log(recovered.words === shape.words, recovered.nested[0] === shape.nested[0]);
console.log(recovered.words[0], recovered.nested[0][1]);
