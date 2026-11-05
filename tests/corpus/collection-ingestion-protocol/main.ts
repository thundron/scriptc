import { make, entries, changed, arrayLike, counters, failure } from "./source.js";

function cursor(mode: string): SetIterator<number> { return make(mode); }
console.log("zero", Array.from(cursor("normal"), () => 7).join(","), counters());
console.log("set", Array.from(new Set(cursor("normal"))).join(","), counters());
for (const mode of ["next", "done", "value", "mapper", "close getter", "close call"]) {
  try { Array.from(cursor(mode), value => { if (value === 10) throw failure; return value; }); }
  catch (error) { console.log(mode, error === failure, counters()); }
}

const mapCursor: MapIterator<[string, number]> = entries("normal");
console.log("map override", new Map(mapCursor).get("same"), counters());
for (const mode of ["key", "value", "primitive"]) {
  const invalid: MapIterator<[string, number]> = entries(mode);
  try { new Map(invalid); } catch (error) {
    console.log("map error", mode, error === failure, error instanceof TypeError, counters());
  }
}
const changedCursor: SetIterator<number> = changed();
console.log("cached next", Array.from(changedCursor).join(","));
const fallback: SetIterator<number> = arrayLike();
console.log("array like", Array.from(fallback).join(","));
try { new Set(fallback); } catch (error) { console.log("requires iterable", error instanceof TypeError); }
