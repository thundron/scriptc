import { read } from "./remote.js";
const key = "scriptc.test.string-cache";
let count = 0;
function compute() { count++; return new Map(); }
globalThis[key] ??= compute();
globalThis[key] ??= compute();
const cache = globalThis[key];
cache.set("message", "hello");
console.log(count, read() === cache, read().get("message"));
const host = globalThis;
host["scriptc.test.string-cache"] = "changed";
console.log(globalThis[key], read());
