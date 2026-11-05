import { types } from "node:util";
import { isMap, isUint8Array, isRegExp, isNativeError, isPromise, isSet } from "node:util/types";
const stored: (value: unknown) => boolean = isUint8Array;
function check(value: unknown): void {
  console.log("probe", stored(value), types.isArrayBufferView(value));
  if (isUint8Array(value)) console.log("bytes", value.length, value[0]);
  if (isMap(value)) {
    console.log("map", value.size, value.get("a"), value.has(42));
    value.set("b", 4);
    for (const [key, entry] of value) console.log("entry", key, entry);
    console.log("delete", value.delete("a"), value.size);
  }
  if (isSet(value)) {
    console.log("set", value.size, value.has(1), value.has("1"));
    value.add(3);
    console.log("set-values", [...value].join(","));
    value.delete(2);
    console.log("set-after", value.size);
  }
  if (isRegExp(value)) console.log("regexp", value.source);
  if (isNativeError(value)) console.log("error", value.message);
  if (isPromise(value)) console.log("promise", true);
}
check(new Uint8Array([1, 2]));
const map = new Map<string, number>([["a", 3]]);
check(map);
console.log("original-map", map.size, map.get("b"));
const set = new Set<number>([1, 2]);
check(set);
console.log("original-set", set.size, set.has(3));
check(/abc/g);
check(new TypeError("bad"));
check(Promise.resolve(1));
check({});
