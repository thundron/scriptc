// Missing collection slots keep JavaScript's undefined result and member
// read errors. A failed receiver read must happen before argument effects.
function report(label: string, run: () => void): void {
  try { run(); }
  catch (error) {
    if (error instanceof Error) console.log(label, error.name, error.message);
    else throw error;
  }
}
const map = new Map<string, number>([["value", 7]]);
const set = new Set([4, 5]);
const maps: Map<string, number>[] = [map];
const sets: Set<number>[] = [set];
maps.length = 3;
sets.length = 3;
let argumentsSeen = 0;
function key(): string { argumentsSeen++; return "value"; }
function number(): number { argumentsSeen++; return 4; }
report("map hole", () => { console.log(maps[1].get(key())); });
report("map outside", () => { console.log(maps[9].has(key())); });
report("map write", () => { maps[2].set(key(), number()); });
report("map delete", () => { maps[1].delete(key()); });
report("map clear", () => { maps[1].clear(); });
report("map size", () => { console.log(maps[1].size); });
report("set hole", () => { console.log(sets[1].has(number())); });
report("set write", () => { sets[2].add(number()); });
report("set delete", () => { sets[1].delete(number()); });
report("set clear", () => { sets[1].clear(); });
report("set size", () => { console.log(sets[1].size); });
console.log("arguments", argumentsSeen);

console.log(maps[1] === undefined, sets[1] === undefined);
console.log(maps[1]?.get(key()), sets[1]?.has(number()), argumentsSeen);
console.log(maps[0].get(key()), sets[0].has(number()), argumentsSeen);
const storedMap = maps[1];
const storedSet = sets[1];
report("stored map", () => { console.log(storedMap.size); });
report("stored set", () => { console.log(storedSet.has(number())); });
console.log("arguments", argumentsSeen);

let receiversSeen = 0;
function mapArray(): Map<string, number>[] { receiversSeen++; return maps; }
function setArray(): Set<number>[] { receiversSeen++; return sets; }
report("map receiver", () => { mapArray()[2].set(key(), number()); });
report("set receiver", () => { setArray()[2].add(number()); });
console.log("receivers", receiversSeen, argumentsSeen);
mapArray()[0].set("other", 8);
setArray()[0].add(6);
console.log(receiversSeen, map.size, set.size);

// Array iteration materializes holes. map() skips them; find() visits
// them, and spreading a missing collection throws at the iteration site.
console.log(maps.map((entry) => entry.size).join(","));
console.log(sets.map((entry) => [...entry].join(":")).join(","));
const mapsCopy = [...maps];
const setsCopy = [...sets];
console.log(0 in mapsCopy, 1 in mapsCopy, 2 in setsCopy);
report("map copied hole", () => { mapsCopy.map((entry) => entry.get(key())); });
report("set copied hole", () => { setsCopy.map((entry) => entry.has(number())); });
report("map find", () => { maps.find((entry) => entry.size === 0); });
report("set find", () => { sets.find((entry) => entry.size === 0); });
report("map spread", () => { console.log([...maps[1]].length); });
report("set spread", () => { console.log([...sets[1]].length); });
console.log("arguments", argumentsSeen);

maps.length = 0;
sets.length = 0;
console.log(maps[0] === undefined, sets[0] === undefined, map.size, set.size);
const optionalMaps: (Map<string, number> | undefined)[] = [map, undefined];
const optionalSets: (Set<number> | undefined)[] = [set, undefined];
console.log(optionalMaps.map((entry) => entry?.size ?? -1).join(","));
console.log(optionalSets.map((entry) => entry?.size ?? -1).join(","));
