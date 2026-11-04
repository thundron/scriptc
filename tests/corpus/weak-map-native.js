const map = new WeakMap();
const key = JSON.parse('{"name":"key"}');
const other = JSON.parse('{"name":"key"}');
const value = JSON.parse('{"count":1}');
console.log(map.set(key, value) === map, map.get(key) === value, map.has(other));
value.count++;
console.log(map.get(key).count, map.delete(key), map.delete(key), map.get(key) === undefined);
map.set(key, undefined);
console.log(map.has(key), map.get(key) === undefined);
map.set(key, 7);
console.log(map.get(key));

const bytes = new Uint8Array(4);
const buffer = bytes.buffer;
const keys = [key, JSON.parse('[]'), bytes, buffer, new WeakMap()];
for (let i = 0; i < keys.length; i++) map.set(keys[i], i);
for (const item of keys) console.log(map.get(item), map.has(item));
console.log(map.get(bytes.buffer), map.get(bytes.subarray(0)) === undefined);
function makeFunction(n) { return () => n; }
const fn = makeFunction(3);
console.log(map.set(fn, "function").get(fn), map.has(makeFunction(3)));

function from(entries) { return new WeakMap(entries); }
const entries = JSON.parse('[[null,1],[null,2]]');
entries[0][0] = key;
entries[1][0] = key;
console.log(from(entries).get(key), from(null).has(key), from(undefined).has(key));
const live = [];
const pair = {};
let reads = 0;
Object.defineProperty(pair, "0", { get() { reads++; live.push([other, 9]); return key; } });
Object.defineProperty(pair, "1", { get() { reads++; return 8; } });
live.push(pair);
const grown = from(live);
console.log(reads, grown.get(key), grown.get(other));
const invalid = [null, undefined, false, 1, "key"];
for (const item of invalid) {
  console.log(map.has(item), map.get(item) === undefined, map.delete(item));
  try { map.set(item, 1); } catch (error) { console.log(error.name, error.message); }
}
for (const item of [[null], [1], [[null, 1]], "x", 7]) {
  try { from(item); } catch (error) { console.log(error.name, error.message); }
}
console.log(map.size === undefined);

console.log(map instanceof WeakMap, map instanceof WeakSet, Object.prototype.toString.call(map));
