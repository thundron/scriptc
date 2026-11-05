function makeMap(entries) { return new Map(entries); }
const value = { count: 3 };
const objectKey = {};
const entries = JSON.parse('[["a",0],["key",4],[0,5],["a",0],[0,6]]');
entries[0][1] = value;
entries[1][0] = objectKey;
entries[2][0] = NaN;
entries[3][1] = value;
entries[4][0] = NaN;
const map = makeMap(entries);
console.log(map.size, map.get("a") === value, map.get(objectKey), map.get(NaN));
console.log(makeMap(null).size, makeMap(undefined).size, makeMap("").size);
console.log(makeMap([["missing"], []]).has(undefined));
console.log(makeMap([["missing"], []]).get("missing") === undefined);

const live = [];
const pair = {};
let reads = 0;
Object.defineProperty(pair, "0", { get() {
  reads++;
  live.push(["second", 2]);
  return "first";
} });
Object.defineProperty(pair, "1", { get() {
  reads++;
  return 1;
} });
live.push(pair);
const grown = makeMap(live);
console.log(reads, grown.size, grown.get("first"), grown.get("second"));
/** @type {any[]} */
const invalidCases = [[1], [null], [undefined], [false], ["abc"], "abc", 7, {}];
for (const invalid of invalidCases) {
  try { makeMap(invalid); } catch (error) { console.log(error.name, error.message); }
}
