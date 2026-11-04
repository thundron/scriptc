const source = new Map<string, number>([["a", 1], ["b", 2], ["c", 3]]);
console.log("map", Array.from(source, ([key, value], index) => key + ":" + (value + index)).join(","));
console.log("zero", Array.from(source.keys(), () => 7).join(","));
console.log("one", Array.from(source.values(), value => value * 2).join(","));
console.log("two", Array.from(source.values(), (value, index) => value + index).join(","));
const cursor = source.values();
cursor.next();
console.log("stored", Array.from(cursor, (value, index) => value + index).join(","), cursor.next().done);
console.log("optional", JSON.stringify(Array.from(source.values(), value => value === 2 ? undefined : value)));
function wider(value: number | string, index: number): string { return String(value) + index; }
console.log("adapted", Array.from(source.values(), wider).join(","));

const live = new Map<string, number>([["a", 1], ["b", 2], ["c", 3]]);
console.log("mutations", Array.from(live.values(), (value, index) => {
  if (index === 0) { live.delete("b"); live.set("d", 4); live.set("a", 10); }
  if (index === 1) { live.delete("a"); live.set("a", 11); }
  return value;
}).join(","));
const clear = new Set([1, 2]);
console.log("clear", Array.from(clear, (value, index) => {
  if (index === 0) { clear.clear(); clear.add(3); }
  return value;
}).join(","));
const stored = new Set([1, 2]);
const storedCursor = stored.values();
console.log("stored live", Array.from(storedCursor, (value, index) => {
  if (index === 0) { stored.delete(2); stored.add(4); }
  return value + index;
}).join(","));

let binding = new Set([1, 2]);
const original = binding;
function mapper(): (value: number) => number {
  original.add(3);
  binding = new Set([8, 9]);
  return value => value * 10;
}
console.log("evaluation", Array.from(binding.values(), mapper()).join(","), Array.from(binding).join(","));

const failure = new Error("mapper failed");
try { Array.from(original, value => { if (value === 2) throw failure; return value; }); }
catch (error) { console.log("failure", error === failure); }
original.clear();
original.add(5);
console.log("recovered", Array.from(original, value => value + 1).join(","));

const interrupted = new Set([1, 2, 3]).values();
try { Array.from(interrupted, value => { if (value === 2) throw failure; return value; }); }
catch (error) { console.log("cursor failure", error === failure); }
console.log("resume", interrupted.next().value, interrupted.next().done);
