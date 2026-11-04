import { types } from "node:util";
import * as direct from "node:util/types";
import { isUint8Array } from "util/types";
let events = "";
function input() { events += "input,"; return new Uint8Array(1); }
function extra() { events += "extra,"; return 9; }
console.log("missing", types.isUint8Array(), types.isMap());
console.log("surplus", types.isUint8Array(input(), extra()), events);
const probes = [types.isTypedArray, direct.isDataView, isUint8Array];
console.log("values", probes.map((probe) => probe(new Uint8Array(0))).join(","));
console.log("identity", isUint8Array === direct.isUint8Array, types.isUint8Array === direct.isUint8Array);
let selected = isUint8Array;
console.log("before", selected(new Uint8Array(1)));
selected = direct.isDataView;
console.log("after", selected(new Uint8Array(1)), selected(new DataView(new ArrayBuffer(2))));
console.log("shape", selected.name, selected.length);
const fake = { [Symbol.toStringTag]: "Uint8Array" };
console.log("spoof", types.isTypedArray(fake), types.isUint8Array(fake));
let reads = 0;
const throwing = { get [Symbol.toStringTag]() { reads++; throw new Error("read tag"); } };
console.log("throwing", types.isMap(throwing), types.isTypedArray(throwing), reads);
const proxy = new Proxy({ x: 1 }, {});
console.log("proxy", types.isProxy(proxy), types.isTypedArray(proxy), types.isMap(proxy));
