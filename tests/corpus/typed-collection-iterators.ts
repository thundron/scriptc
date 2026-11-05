// Stored Map/Set cursors execute in the native runtime, retaining live
// collections across function calls, aliases, mutations, and exhaustion.
const scores = new Map<string, number>([["alice", 10], ["bob", 20]]);
const values = scores.values();
console.log(values.next().value);
scores.delete("bob");
scores.set("carol", 30);
console.log(values.next().value);
console.log(values.next().done);
scores.set("dave", 40);
console.log(values.next().done);

function take(cursor: MapIterator<number>): number {
  const step = cursor.next();
  return step.done ? -1 : step.value;
}
const passed = scores.values();
console.log(take(passed), take(passed), take(passed), take(passed));

const keys = scores.keys();
const alias = keys;
console.log(keys.next().value, alias.next().value);
for (const key of keys) console.log("key", key);
const entries = scores.entries();
for (const [key, value] of entries) console.log("entry", key, value);

const set = new Set<number>([1, 2]);
const setValues = set.values();
console.log(setValues.next().value);
set.clear();
set.add(3);
console.log(setValues.next().value, setValues.next().done);
set.add(4);
console.log(setValues.next().done);
const setKeys = set.keys();
console.log(setKeys.next().value);
const setEntries = set.entries();
for (const [a, b] of setEntries) console.log("set entry", a, b);

// Breaking a loop leaves a collection cursor open, and concurrent cursors
// each observe the live collection at their own position.
const live = new Map<string, number>([["a", 1], ["b", 2], ["c", 3]]);
const first = live.values();
const second = live.values();
for (const value of first) {
  console.log("break", value);
  break;
}
live.delete("b");
live.set("a", 10);
live.set("b", 20);
console.log("resume", first.next().value, second.next().value);
live.clear();
live.set("d", 4);
console.log("clear", first.next().value, second.next().value);
console.log("spread", [...first].join(","), Array.from(second).join(","));

// The iterator keeps its source alive after the source binding is gone.
function makeCursor(): SetIterator<string> {
  return new Set<string>(["x", "y", "z"]).keys();
}
const retained = makeCursor();
console.log("retained", retained.next().value, [...retained].join(","));
const empty = new Map<string, number>();
const emptyCursor = empty.values();
empty.set("late", 5);
console.log("empty", emptyCursor.next().value, emptyCursor.next().done);
empty.set("later", 6);
console.log("exhausted", emptyCursor.next().done);
