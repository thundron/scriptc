// Array.prototype.concat (elements and same-element arrays, one-level
// spread exactly like IsArray), the elements forms of new Array, for-of
// over heterogeneous tuples (positions project into the union), for-of
// over xs.values() on arrays, the read-only tuple methods slice/map
// (positions snapshot, then the ordinary array machinery runs), and
// String.raw over an explicit template record. Node is the oracle.

var a: string[] = [];
console.log(a.concat("hello", "world").join(","));
console.log(a.concat("Hello").length);
var b = new Array<string>();
console.log(b.concat("x").length, b.length);
var m: string[] = ["a"];
console.log(m.concat(["b", "c"], "d", ["e"]).join("|"));
console.log(m.length);
let ijs: [number, number][] = [[1, 2]];
ijs = ijs.concat([[3, 4], [5, 6]]);
console.log(ijs.length, ijs[2][1]);

var x: string[];
x = new Array('hi', 'bye');
console.log(x.join(","));
x = new Array<string>('one');
console.log(x[0]);

var tuple: [string, boolean] = ["s", true];
for (var v of tuple) { if (typeof v === "string") { console.log("str", v); } else { console.log("bool", v); } }
var htuple: [string, number, string] = ["a", 1, "b"];
for (const w of htuple) { if (typeof w === "string") { console.log("string", w); } else { console.log("number", w); } }
for (var vv of [""].values()) { console.log("val", JSON.stringify(vv)); }
for (const n of [10, 20].values()) { console.log(n); }

let numTuple: [number] = [1];
console.log(numTuple.map(q => q * q).join(","));
let numNum: [number, number] = [100, 100];
let strStr: [string, string] = ["hello", "hello"];
let numStr: [number, string] = [100, "hello"];
console.log(numNum.map(n2 => n2 * n2).join(","));
console.log(strStr.map(s2 => s2.charCodeAt(0)).join(","));
console.log(numStr.map(x2 => x2).length);
let t5: [number, string] = [42, "hello"];
console.log(t5.slice().length, t5.slice(1).length, t5.slice(0, 1).length);
console.log(JSON.stringify(numNum.slice(1)));

console.log(String.raw({ raw: ["foo", "bar", "baz"] }, 1, 2));
console.log(String.raw({ raw: ["a", "b"] }, "X", "dropped"));
console.log(String.raw({ raw: ["only"] }));
console.log(String.raw({ raw: ["p", "q", "r"] }, true));
const obj = { raw: ["<", ">"] };
console.log(String.raw(obj, { a: 1 }));
