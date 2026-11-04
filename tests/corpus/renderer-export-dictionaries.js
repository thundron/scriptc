const define = Object.defineProperty;
function publish(target, all) {
  for (var name in all) define(target, name, { get: all[name], enumerable: true });
}
let live = "first";
const exports = {};
publish(exports, { value: () => live, size: () => 2 });
console.log(exports.value, exports.size);
live = "second";
console.log(exports.value, Object.keys(exports).join(","));
let visits = 0;
const source = JSON.parse('{"10":"ten","2":"two","first":"one","removed":"gone"}');
define(source, "lazy", { get: () => { visits++; return "lazy"; }, enumerable: true });
define(source, "hidden", { value: "hidden" });
function receiver() { console.log("receiver"); return source; }
for (const key in receiver()) {
  console.log(key);
  if (key === "first") { delete source.removed; source.added = "late"; }
}
console.log(visits, Object.keys(source).join(","));
/** @param {any} value */
function names(value = null) {
  const keys = [];
  for (const key in value) keys.push(key);
  return keys.join(",");
}
console.log(names(null), names(undefined), names(4), names(true));
console.log(names("a😀b"), names(["x", "y"]));
