type Leaf = { text: string };
type Branch = { kind: "branch"; child: Leaf } | { kind: "empty"; reason: string };
type Root = { branch: Branch };

function root(text: string): Root {
  return { branch: { kind: "branch", child: { text } } };
}

let current = root("first");
function replace(): string {
  current = root("second");
  return "!";
}
if (current.branch.kind === "branch") {
  console.log(current.branch.child.text + replace());
}
console.log(current.branch.kind);

function replaceChild(value: Leaf): string {
  value.text = "changed";
  return "?";
}
if (current.branch.kind === "branch") {
  console.log(current.branch.child.text + replaceChild(current.branch.child));
  console.log(current.branch.child.text);
}

let calls = 0;
function temporary(): Root {
  calls++;
  return root("temporary");
}
function project(value: Root): Leaf {
  if (value.branch.kind === "branch") return value.branch.child;
  throw new Error(value.branch.reason);
}
const saved = project(temporary());
console.log(saved.text, calls);
console.log(temporary().branch.kind, calls);

class Holder {
  nested: Root;
  constructor(nested: Root) { this.nested = nested; }
}
function fromClass(holder: Holder): string {
  const branch = holder.nested.branch;
  return branch.kind === "branch" ? branch.child.text : branch.reason;
}
console.log(fromClass(new Holder(root("class"))));
console.log(fromClass(new Holder({ branch: { kind: "empty", reason: "none" } })));

function captured(): void {
  let value = root("captured");
  const update = (): string => { value = root("updated"); return "."; };
  if (value.branch.kind === "branch") console.log(value.branch.child.text + update());
  if (value.branch.kind === "branch") console.log(value.branch.child.text);
}
captured();

function fail(): string { throw new Error("failed"); }
try {
  console.log(project(temporary()).text + fail());
} catch (error) {
  if (error instanceof Error) console.log(error.message, calls);
}

for (let i = 0; i < 500; i++) {
  const value = project(root("loop" + i));
  if (i === 499) console.log(value.text);
}

type Shared =
  | { kind: "one"; text: string; enabled: boolean; count: number }
  | { kind: "two"; text: string; enabled: boolean; extra: string };
function shared(value: Shared): void {
  console.log(value.kind, value.text, value.enabled);
}
shared({ kind: "one", text: "first", enabled: true, count: 1 });
shared({ kind: "two", text: "second", enabled: false, extra: "tail" });

type Different =
  | { kind: "small"; padding: boolean; text: string }
  | { kind: "wide"; padding: number; text: string }
  | { text: string; kind: "reordered" };
function different(value: Different): void { console.log(value.text, value.kind); }
different({ kind: "small", padding: true, text: "boolean prefix" });
different({ kind: "wide", padding: 2, text: "number prefix" });
different({ text: "different offset", kind: "reordered" });
