const source = new Map<string, number>([["a", 1], ["b", 2], ["c", 2]]);
const readonlySource: ReadonlyMap<string, number> = source;
console.log("array views", Array.from(readonlySource.keys()).join(","), Array.from(source.values()).join(","));
console.log("map entries", JSON.stringify(Array.from(source)), JSON.stringify(Array.from(source.entries())));
console.log("copies", new Map(source.entries()).get("b"), new Map(source).size, new Set(source.values()).size);

const cursor = source.entries();
const alias = cursor;
console.log("first", cursor.next().value?.[0]);
source.delete("b");
source.set("d", 4);
source.set("b", 5);
const remaining = new Map(alias);
console.log("remaining", JSON.stringify(Array.from(remaining)), cursor.next().done);
source.set("e", 6);
console.log("exhausted", new Map(cursor).size);

const pairs = new Set<[string, number]>([["x", 1], ["y", 2], ["x", 3]]);
console.log("set map", JSON.stringify(Array.from(new Map(pairs))), new Map(pairs.values()).get("x"));
const setCursor = pairs.keys();
setCursor.next();
console.log("set cursor map", JSON.stringify(Array.from(new Map(setCursor))));
const values = new Set([1, 2]);
console.log("set views", Array.from(values.keys()).join(","), Array.from(values.values()).join(","));
console.log("set entries", JSON.stringify(Array.from(values.entries())), new Map(values.entries()).get(2));
console.log("set copies", new Set(values).size, new Set(values.entries()).size, new Set(source).size);

function retained(): MapIterator<[string, number]> { return new Map([["retained", 8]]).entries(); }
console.log("retained", new Map(retained()).get("retained"));
const empty = new Map<string, number>();
const pending = empty.entries();
empty.set("late", 9);
console.log("pending", new Map(pending).get("late"));
const cleared = empty.entries();
empty.clear();
empty.set("fresh", 10);
console.log("clear", new Map(cleared).get("fresh"));

let calls = 0;
function once(): Map<string, number> { calls++; return source; }
console.log("once", Array.from(once().keys()).length, new Map(once().entries()).size, new Set(once().values()).size, calls);
const optional = [source];
console.log("present", Array.from(optional[0].values()).length);
try { Array.from(optional[1].values()); } catch (error) { console.log("missing", error instanceof TypeError); }
