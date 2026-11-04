export {};

// An optional receiver contains several array representations. Each array
// element has its own tag layout, distinct from the joined result union.
type Payload = { name: string; values: number[] };
type Source = (Payload | null)[] | (string | null)[] | undefined;
const shared: Payload = { name: "shared", values: [1] };
const records: (Payload | null)[] = [shared, null];
const strings: (string | null)[] = ["text", null];
let evaluations = 0;
let indexes = 0;

function source(mode: number): Source {
  evaluations++;
  if (mode === 0) return records;
  if (mode === 1) return strings;
  return undefined;
}
function index(value: number): number {
  indexes++;
  return value;
}
function show(mode: number, offset: number): void {
  const value = source(mode)?.[index(offset)];
  if (value === undefined) console.log("undefined");
  else if (value === null) console.log("null");
  else if (typeof value === "string") console.log("string", value);
  else {
    value.values.push(2);
    console.log("payload", value.name, value.values.join(","));
  }
}
for (let mode = 0; mode < 3; mode++) {
  show(mode, 0);
  show(mode, 1);
}
console.log("evaluations", evaluations, indexes);
console.log("shared", shared.values.join(","));

// Index evaluation may replace the receiver's original binding. The
// optional-chain guard and widened result each retain the right owner.
let active: Source = records;
function current(): Source { return active; }
function replace(): number {
  active = strings;
  return 0;
}
const before = current()?.[replace()];
if (before && typeof before !== "string") console.log("before", before.name);
console.log("after", current()?.[0]);

// An owned temporary array disappears after the read. The widened box
// must retain its reference payload before releasing the original box.
function fresh(mode: number): (Payload | null)[] | (string | null)[] {
  if (mode === 0) return [{ name: "fresh", values: [7, 8] }];
  return ["fresh text"];
}
let total = 0;
for (let i = 0; i < 200; i++) {
  const value = fresh(i % 2)[0];
  if (typeof value === "string") total += value.length;
  else if (value !== null) total += value.values.length;
}
console.log("temporary total", total);

// A missing receiver and a present null element take different unit
// paths; a lazy default runs once for each and never for present strings.
let defaults = 0;
function fallback(): string { defaults++; return "fallback"; }
console.log(source(1)?.[0] ?? fallback());
console.log(source(1)?.[1] ?? fallback());
console.log(source(2)?.[0] ?? fallback());
console.log("defaults", defaults);
