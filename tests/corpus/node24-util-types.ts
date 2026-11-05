import { types } from "node:util";
import * as direct from "node:util/types";
import { isUint8Array as bytes } from "util/types";

function report(label: string, value: unknown): void {
  console.log(label, [types.isAnyArrayBuffer(value), types.isArrayBuffer(value), types.isArrayBufferView(value), types.isDataView(value), types.isTypedArray(value), types.isUint8Array(value), types.isUint8ClampedArray(value), types.isUint16Array(value), types.isUint32Array(value), types.isInt8Array(value), types.isInt16Array(value), types.isInt32Array(value), types.isFloat32Array(value), types.isFloat64Array(value), types.isMap(value), types.isSet(value), types.isWeakMap(value), types.isWeakSet(value), types.isRegExp(value), types.isNativeError(value), types.isPromise(value), types.isProxy(value), types.isAsyncFunction(value), types.isGeneratorFunction(value), types.isGeneratorObject(value)].join(","));
}
report("undefined", undefined);
report("null", null);
report("number", 12);
report("string", "Uint8Array");
report("array", [1, 2]);
report("lookalike", { name: "Map", byteLength: 8, then: () => 1 });
report("buffer", Buffer.from("hello"));
report("uint8", new Uint8Array(2));
report("clamped", new Uint8ClampedArray(2));
report("uint16", new Uint16Array(2));
report("uint32", new Uint32Array(2));
report("int8", new Int8Array(2));
report("int16", new Int16Array(2));
report("int32", new Int32Array(2));
report("float32", new Float32Array(2));
report("float64", new Float64Array(2));
report("arraybuffer", new ArrayBuffer(8));
report("dataview", new DataView(new ArrayBuffer(8)));
report("map", new Map<string, number>([["one", 1]]));
report("set", new Set<number>([1, 2]));
report("weakmap", new WeakMap<object, string>());
report("weakset", new WeakSet<object>());
report("regexp", /abc/g);
report("error", new TypeError("bad"));
report("promise", Promise.resolve(3));
report("function", () => 1);
async function asyncFunction(): Promise<number> { return 2; }
function* generator(): Generator<number> { yield 4; }
async function* asyncGenerator(): AsyncGenerator<number> { yield 5; }
report("async", asyncFunction);
report("generator-function", generator);
report("async-generator-function", asyncGenerator);
report("generator", generator());
report("async-generator", asyncGenerator());
report("proxy", new Proxy({ x: 1 }, {}));
const stored: (value: unknown) => boolean = direct.isUint8Array;
console.log("aliases", stored(new Uint8Array(0)), bytes(Buffer.alloc(0)), stored === bytes, direct.isArrayBuffer(new ArrayBuffer(0)));
function narrow(value: unknown): void {
  if (types.isUint8Array(value)) console.log("narrow", value.length, value[0]);
}
narrow(new Uint8Array([7, 8]));
narrow("no");
