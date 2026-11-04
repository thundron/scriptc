function from(entries) { return Object.fromEntries(entries); }
const payload = JSON.parse('{"count":3}');
const entries = JSON.parse('[[4,null],["a",2],["a",3],["__proto__",null],[],["missing"]]');
entries[0][1] = payload;
entries[3][1] = payload;
const object = from(entries);
console.log(Object.keys(object).join(","), object[4] === payload, object.a);
console.log(object.__proto__ === payload, Object.hasOwn(object, "__proto__"));
console.log(Object.hasOwn(object, "missing"), object.missing === undefined, Object.hasOwn(object, "undefined"));
const reverse = Object.fromEntries(Object.entries({ first: 1, second: 2 }).map(([k, v]) => [v, k]));
console.log(reverse[1], reverse[2]);

const order = [];
const live = [];
const key = { toString() { order.push("key"); return "first"; } };
const entry = {};
Object.defineProperty(entry, "0", { get() { order.push("0"); live.push(["second", 2]); return key; } });
Object.defineProperty(entry, "1", { get() { order.push("1"); return payload; } });
live.push(entry);
const grown = from(live);
console.log(order.join(","), grown.first === payload, grown.second);
const badKey = {};
Object.defineProperty(badKey, "0", { get() { throw new Error("read 0"); } });
const badValue = {};
Object.defineProperty(badValue, "1", { get() { throw new Error("read 1"); } });
for (const throwing of [badKey, badValue]) {
  try { from([throwing]); } catch (error) { console.log(error.name, error.message); }
}
for (const invalid of [null, undefined, 7, {}, [1], [null], [undefined], [false], ["abc"], "abc"]) {
  try { from(invalid); } catch (error) { console.log(error.name, error.message); }
}
function reverseMapping(mapping) {
  return Object.fromEntries(Object.entries(mapping).map(([key, value]) => [value, key]));
}
console.log(reverseMapping({ unicode: 0, "unicode-wide": 1, wcwidth: 2 })[1]);
console.log(reverseMapping({ first: "a", second: "b" }).b);

function defineEnum(mapping, base = "u32") {
  const reverse = Object.fromEntries(Object.entries(mapping).map(([key, value]) => [value, key]));
  return { base, to(value) { return mapping[value]; }, from(value) { return reverse[value]; } };
}
const numeric = defineEnum({ unicode: 0, "unicode-wide": 1, wcwidth: 2 });
const stringy = defineEnum({ yes: "Y", no: "N" }, "string");
console.log(numeric.base, numeric.to("unicode-wide"), numeric.from(1));
console.log(stringy.base, stringy.to("yes"), stringy.from("N"));
