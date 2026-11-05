interface Options {
  sources?: ReadonlyMap<string, string>;
  names?: ReadonlySet<string>;
}

function lookup(options: Options, key: string): string {
  const sources = options.sources;
  if (sources === undefined) return "absent";
  return sources.get(key) ?? "missing";
}

function count(options: Options): number {
  return options.names?.size ?? -1;
}

function chooseMap(mode: number, value: Map<string, number>): Map<string, number> | null | undefined {
  if (mode === 0) return undefined;
  if (mode === 1) return null;
  return value;
}

function chooseSet(mode: number, value: Set<string>): Set<string> | null | undefined {
  if (mode === 0) return undefined;
  if (mode === 1) return null;
  return value;
}

const sources = new Map<string, string>([["first.ts", "hello"], ["second.ts", "world"]]);
const names = new Set<string>(["first.ts", "second.ts"]);
console.log(lookup({}, "first.ts"), count({}));
console.log(lookup({ sources, names }, "first.ts"), count({ sources, names }));
console.log(lookup({ sources }, "other.ts"));

const values = new Map<string, number>([["value", 7]]);
for (let mode = 0; mode < 3; mode++) {
  const map = chooseMap(mode, values);
  const set = chooseSet(mode, names);
  console.log(mode, map === undefined, map === null, Boolean(map), typeof map);
  console.log(mode, set === undefined, set === null, Boolean(set), typeof set);
  console.log(map?.get("value"), set?.has("first.ts"));
  const present = map ?? values;
  present.set("value", (present.get("value") ?? 0) + 1);
  console.log(present === values, present.size, values.get("value"));
  if (set) {
    set.add("third.ts");
    console.log(set === names, [...set].join(","));
  }
}

function defaultMap(map: Map<string, number> = new Map<string, number>()): Map<string, number> {
  map.set("default", 12);
  return map;
}

function defaultSet(set: Set<string> = new Set<string>()): Set<string> {
  set.add("default");
  return set;
}

console.log(defaultMap().get("default"), defaultMap(values) === values);
console.log(defaultSet().has("default"), defaultSet(names) === names);

const optional: (Map<string, number> | undefined)[] = [undefined, values];
for (const map of optional) {
  if (map !== undefined) console.log([...map.keys()].join(","));
  else console.log("no map");
}

interface Holder {
  map?: Map<string, number>;
  set?: Set<string>;
}
const holder: Holder = {};
holder.map = values;
holder.set = names;
console.log(holder.map === values, holder.set === names);
holder.map = undefined;
holder.set = undefined;
console.log(holder.map, holder.set);
