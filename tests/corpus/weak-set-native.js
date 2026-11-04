const key = JSON.parse('{}');
const other = JSON.parse('{}');
const set = new WeakSet();
console.log(set.add(key) === set, set.has(key), set.has(other));
console.log(set.delete(key), set.delete(key), set.has(key));
const bytes = new Uint16Array(4);
const buffer = bytes.buffer;
const collection = new WeakMap();
const keys = [key, JSON.parse('[]'), bytes, buffer, collection, set];
const seeded = new WeakSet(keys);
for (const item of keys) console.log(seeded.has(item));
console.log(seeded.has(bytes.subarray(1).buffer), seeded.has(bytes.subarray(1)));
function from(items) { return new WeakSet(items); }
console.log(from(null).has(key), from(undefined).has(key));
for (const item of [null, undefined, false, 1, "key"]) {
  console.log(set.has(item), set.delete(item));
  try { set.add(item); } catch (error) { console.log(error.name, error.message); }
}
for (const item of [[null], [1], "x", 7]) {
  try { from(item); } catch (error) { console.log(error.name, error.message); }
}
console.log(set.size === undefined);

console.log(set instanceof WeakSet, set instanceof WeakMap, Object.prototype.toString.call(set));
