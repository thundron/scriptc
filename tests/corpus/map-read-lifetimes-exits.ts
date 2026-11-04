interface Cell { value: number; }
const cells = new Map<number, Cell>();

function read(value: Cell | undefined, extra: number): number {
  if (value === undefined) throw new Error("missing");
  if (extra < 0) throw new Error("callee");
  return value.value + extra;
}
function replaceAndThrow(): number {
  cells.clear();
  throw new Error("argument");
}
for (let i = 0; i < 3; i++) {
  cells.set(0, { value: i });
  try {
    console.log("unreachable", read(cells.get(0), replaceAndThrow()));
  } catch (error) {
    console.log("later argument", error instanceof Error ? error.message : "unknown", cells.size);
  }
  cells.set(0, { value: i + 10 });
  try {
    console.log("unreachable", read(cells.get(0), -1));
  } catch (error) {
    console.log("callee", error instanceof Error ? error.message : "unknown");
  }
}

function lexical(mode: number): number {
  for (let i = 0; i < 3; i++) {
    cells.set(0, { value: i + 20 });
    const value = cells.get(0);
    cells.clear();
    if (mode === 0) continue;
    if (mode === 1) break;
    if (mode === 2) return value === undefined ? -1 : value.value;
    throw new Error(value === undefined ? "absent" : String(value.value));
  }
  return 99;
}
for (let mode = 0; mode < 4; mode++) {
  try { console.log("lexical", mode, lexical(mode)); }
  catch (error) { console.log("lexical error", error instanceof Error ? error.message : "unknown"); }
}

function nested(value: Cell | undefined): number {
  const original = value === undefined ? 0 : value.value;
  cells.clear();
  cells.set(0, { value: original + 1 });
  return read(cells.get(0), original);
}
cells.set(0, { value: 30 });
console.log("nested", read(cells.get(0), nested(cells.get(0))));
try { console.log("missing", read(cells.get(1), 0)); }
catch (error) { console.log("missing error", error instanceof Error ? error.message : "unknown"); }
