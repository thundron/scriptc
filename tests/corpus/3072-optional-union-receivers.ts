export {};

type Leaf = { kind: "leaf"; text: string; payload: { name: string } };
type Branch = { kind: "branch"; children: Node[]; payload: { name: string } };
type Node = Leaf | Branch;

const leaf: Leaf = { kind: "leaf", text: "hello", payload: { name: "leaf payload" } };
const branch: Branch = { kind: "branch", children: [leaf], payload: { name: "branch payload" } };
const nodes: (Node | null | undefined)[] = [leaf, branch, null, undefined];
let reads = 0;
let keys = 0;
let argumentsRun = 0;

function read(index: number): Node | null | undefined {
  reads++;
  return nodes[index];
}
function key(): "payload" {
  keys++;
  return "payload";
}
function suffix(): string {
  argumentsRun++;
  return "!";
}

for (let i = 0; i < nodes.length; i++) {
  console.log(read(i)?.kind ?? "absent");
  console.log(read(i)?.payload.name.toUpperCase() ?? "absent");
  console.log(read(i)?.[key()].name.indexOf(suffix()) ?? -2);
}
console.log("evaluations", reads, keys, argumentsRun);

// The guard owns the receiver even when an argument replaces its source.
let active: Node | undefined = leaf;
function current(): Node | undefined { return active; }
function replace(): string {
  active = branch;
  return "leaf";
}
console.log(current()?.payload.name.indexOf(replace()));
console.log(current()?.payload.name);

// A shared field may itself be a union, and a later optional step gets
// its own guard. Neither step may lose the earlier short-circuit.
type Named = { kind: "named"; next: Node | null };
type Counted = { kind: "counted"; count: number; next: Node | null };
function nested(value: Named | Counted | undefined): string {
  return value?.next?.payload.name.toUpperCase() ?? "missing";
}
console.log(nested({ kind: "named", next: leaf }));
console.log(nested({ kind: "counted", count: 2, next: branch }));
console.log(nested({ kind: "named", next: null }));
console.log(nested(undefined));

// Optional method calls with no return value still guard their arguments.
type Writer = { kind: "writer"; write: (text: string) => void };
type Logger = { kind: "logger"; id: number; write: (text: string) => void };
function emit(writer: Writer | Logger | null): void {
  writer?.write(suffix());
}
emit({ kind: "writer", write: (text) => console.log("write", text) });
emit({ kind: "logger", id: 1, write: (text) => console.log("log", text) });
emit(null);
console.log("arguments", argumentsRun);

// Surviving records are the original objects, including after a union
// retag, so mutations through a selected payload remain visible.
function payload(value: Node | undefined): { name: string } | undefined {
  return value?.payload;
}
const selected = payload(leaf);
if (selected) selected.name = "changed";
console.log(leaf.payload.name, payload(undefined) === undefined);

// Control flow can select several variants sharing a field without
// reducing to a single variant. Unrelated variants need no such field.
type Other = { kind: "other"; code: number };
function describe(value: Node | Other): string {
  if (value.kind === "other") return "other:" + value.code;
  return value.payload.name;
}
console.log(describe(leaf), describe(branch), describe({ kind: "other", code: 7 }));

// Repeated loop evaluation exercises cleanup of both guard paths.
let count = 0;
for (let i = 0; i < 100; i++) {
  count += read(i % 4)?.kind.length ?? 0;
}
console.log("count", count);
