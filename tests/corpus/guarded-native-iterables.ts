const maps = new Map<string, ReadonlyMap<string, string>>([
  ["present", new Map<string, string>([["first", "a"], ["second", "b"]])],
]);
const sets = new Map<string, ReadonlySet<number>>([
  ["present", new Set<number>([1, 2, 3])],
]);

for (const name of ["missing", "present"]) {
  const map = maps.get(name);
  if (map !== undefined) {
    for (const [key, value] of map) console.log("map", key, value);
  }
  const set = sets.get(name);
  if (set !== undefined) {
    for (const value of set) console.log("set", value);
  }
}

function nullableMap(present: boolean): Map<string, number> | null {
  return present ? new Map<string, number>([["first", 1], ["second", 2]]) : null;
}
function nullableSet(present: boolean): Set<string> | undefined {
  return present ? new Set<string>(["first", "second"]) : undefined;
}
function nullableText(present: boolean): string | null {
  return present ? "a😀z" : null;
}
function nullableBytes(present: boolean): Uint8Array | undefined {
  return present ? new Uint8Array([3, 5, 7]) : undefined;
}

for (const present of [false, true]) {
  const map = nullableMap(present);
  if (map !== null) for (const [key, value] of map) {
    console.log("live map", key, value);
    if (key === "first") map.set("third", 3);
  }
  const set = nullableSet(present);
  if (set) for (const value of set) {
    console.log("live set", value);
    if (value === "first") set.add("third");
    if (value === "second") continue;
  }
  const text = nullableText(present);
  if (text !== null) for (const point of text) console.log("point", point);
  const bytes = nullableBytes(present);
  if (bytes !== undefined) for (const byte of bytes) {
    console.log("byte", byte);
    if (byte === 5) break;
  }
}

// Assertions affect types, so a missing runtime value must still throw.
try {
  for (const pair of nullableMap(false)!) console.log(pair[0]);
} catch (error) {
  console.log("absent map", error instanceof TypeError);
}
try {
  for (const value of nullableSet(false)!) console.log(value);
} catch (error) {
  console.log("absent set", error instanceof TypeError);
}

// Nested map reads keep native container identity and mutation visibility.
const mutable = new Map<string, Map<string, number>>([
  ["group", new Map<string, number>([["one", 1]])],
]);
const group = mutable.get("group");
if (group !== undefined) {
  for (const [key, value] of group) {
    console.log("nested", key, value);
    if (key === "one") group.set("two", 2);
  }
}
console.log("identity", mutable.get("group") === group);
