export {};

type Payload = { name: string; values: number[] };
type Rich = { kind: "present"; payload: Payload; privateCount: number };
type Value = { kind: string; payload: Payload };
const shared: Payload = { name: "shared", values: [1] };
let reads = 0;
let defaults = 0;

function source(mode: number): Rich | null | undefined {
  reads++;
  if (mode === 0) return null;
  if (mode === 1) return undefined;
  return { kind: "present", payload: shared, privateCount: mode };
}
function fallback(): Value {
  defaults++;
  return { kind: "fallback", payload: { name: "default", values: [2, 3] } };
}
function select(mode: number): Value | string {
  // The present record narrows structurally into one arm of the result
  // union. The fallback must stay lazy even when the arm needs a new tag.
  const answer: Value | string = source(mode) ?? (mode === 0 ? fallback() : "absent");
  return answer;
}
for (const mode of [0, 1, 2, 3]) {
  const value = select(mode);
  if (typeof value === "string") console.log("value", value);
  else {
    value.payload.values.push(mode);
    console.log(value.kind, value.payload.name, value.payload.values.join(","));
  }
}
console.log("counts", reads, defaults);
console.log("shared", shared.values.join(","));

// A source union can retain multiple present records with different
// layouts. A default introduces a third layout, and each selected payload
// must land in its matching arm without evaluating the unselected branch.
type Left = { kind: "left"; left: Payload };
type Right = { kind: "right"; right: Payload };
function choice(mode: number): Left | Right | undefined {
  reads++;
  if (mode === 0) return undefined;
  return mode === 1 ? { kind: "left", left: shared } : { kind: "right", right: shared };
}
function show(mode: number): void {
  const value = choice(mode) ?? fallback();
  if ("left" in value) console.log("left", value.left.name);
  else if ("right" in value) console.log("right", value.right.name);
  else console.log("fallback", value.payload.name);
}
show(0);
show(1);
show(2);
console.log("counts", reads, defaults);

// Guards and defaults compose: no call on a missing optional receiver,
// and a throwing fallback remains unreachable on either present variant.
function fail(): string { throw new Error("unexpected fallback"); }
function name(value: Left | Right | null): string | undefined {
  return value?.kind;
}
console.log(name({ kind: "left", left: shared }) ?? fail());
console.log(name({ kind: "right", right: shared }) ?? fail());
console.log(name(null) ?? "none");

// Repeated fresh fallback and retained present payloads exercise cleanup
// on each branch of the retagging path in sanitized native runs.
let length = 0;
for (let i = 0; i < 100; i++) {
  const value = select(i % 3);
  if (typeof value !== "string") length += value.payload.values.length;
}
console.log("length", length, "counts", reads, defaults);
