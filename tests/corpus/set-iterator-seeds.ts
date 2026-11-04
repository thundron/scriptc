const source = new Map<string, number>([["a", 1], ["b", 2], ["c", 2]]);
const readonlySource: ReadonlyMap<string, number> = source;
console.log("keys", [...new Set(readonlySource.keys())].join(","));
console.log("values", [...new Set(source.values())].join(","));

// Construction consumes the remaining live cursor and exhausts every alias.
const cursor = source.keys();
const alias = cursor;
console.log("first", cursor.next().value);
source.delete("b");
source.set("d", 4);
source.set("b", 5);
console.log("remaining", [...new Set(alias)].join(","));
source.set("e", 6);
console.log("done", cursor.next().done, new Set(cursor).size);

const cleared = source.values();
console.log("before clear", cleared.next().value);
source.clear();
source.set("fresh", 7);
console.log("after clear", [...new Set(cleared)].join(","));

const empty = new Map<string, number>();
const pending = empty.values();
empty.set("added", 8);
console.log("pending", [...new Set(pending)].join(","));
const exhausted = empty.keys();
console.log("exhaust", new Set(exhausted).size);
empty.set("later", 9);
console.log("still done", new Set(exhausted).size);

let calls = 0;
function makeCursor(): SetIterator<string> {
  calls++;
  return new Set<string>(["red", "green", "red"]).values();
}
console.log("temporary", [...new Set(makeCursor())].join(","), calls);
const set = new Set<string>(["x", "y"]);
const readonlySet: ReadonlySet<string> = set;
console.log("set keys", [...new Set(readonlySet.keys())].join(","));
const setCursor = set.values();
console.log("set first", setCursor.next().value);
set.delete("y");
set.add("z");
console.log("set rest", [...new Set(setCursor)].join(","), setCursor.next().done);

const numbers = new Map<string, number>([["n1", NaN], ["n2", NaN], ["minus", -0], ["plus", 0]]);
const unique = new Set(numbers.values());
console.log("same value", unique.size, unique.has(NaN), unique.has(-0));
for (const value of unique) console.log("canonical", Number.isNaN(value), Object.is(value, -0));

const left = new Map<string, number>([["left", 1]]);
const right = new Set<string>(["right"]);
const chooseLeft = calls === 1;
console.log("conditional", [...new Set(chooseLeft ? left.keys() : right.values())].join(","));

const checked = new Map<string, unknown>([["number", 1], ["text", "1"], ["duplicate", 1]]);
const checkedSet = new Set(checked.values());
console.log("checked", checkedSet.size, checkedSet.has(1), checkedSet.has("1"));
