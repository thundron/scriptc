const text = String.fromCodePoint(0, 65, 0x7ff, 0x800, 0xffff, 0x10000, 0x1f4a1, 0x10ffff);
console.log(Buffer.from(text).toString("hex"), text.length);
console.log(String.fromCodePoint() === "", String.fromCodePoint(-0).charCodeAt(0));
console.log(String.fromCodePoint(...[65, 0x1f4a1, 90]));
console.log(String.fromCodePoint(...new Uint32Array([0x3bb, 0x1f4a1])));
console.log(String.fromCodePoint(...new Float64Array([65, 66])));
// UTF-8 output replaces lone surrogates; adjacent surrogate inputs combine.
console.log(String.fromCodePoint(0xd83d, 0xdca1), String.fromCodePoint(0xd800, 65, 0xdc00));
for (const point of [-1, 1.5, NaN, Infinity, -Infinity, 0x110000]) {
  try { String.fromCodePoint(65, point); }
  catch (e) { if (e instanceof Error) console.log(e.name, e.message); }
}
try { String.fromCodePoint(...new Float32Array([65, 1.5])); }
catch (e) { if (e instanceof Error) console.log(e.name, e.message); }
const sparse: number[] = [];
sparse.length = 2;
try { String.fromCodePoint(...sparse); }
catch (e) { if (e instanceof Error) console.log("sparse", e.name, e.message); }
let order = "";
function point(value: number): number { order += value.toString() + ";"; return value; }
try { String.fromCodePoint(point(-1), point(65)); }
catch (e) { if (e instanceof Error) console.log(order, e.name, e.message); }
