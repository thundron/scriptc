// Module namespace objects are first-class nominal values and their member
// reads stay live. Object.values remains fenced because materializing a
// heterogeneous live-value array has no sound static representation.
import * as lib from "./lib.ts";

console.log(lib.one());
const grabbed = lib;
console.log(grabbed.one());
console.log(Object.values(grabbed));
// Namespace value enumeration remains explicit.
