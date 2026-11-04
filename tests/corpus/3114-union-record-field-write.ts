// A common writable field is updated on the original union arm.
interface Branch { kind: "branch"; value: string; count: number; children: string[] }
interface Leaf { kind: "leaf"; value: string; count: number; enabled: boolean }
type Entry = Branch | Leaf;
const branch: Branch = { kind: "branch", value: "branch", count: 1, children: ["child"] };
const leaf: Leaf = { kind: "leaf", value: "leaf", count: 2, enabled: true };
const index = new Map<Entry, string>();
index.set(branch, "branch-id");
index.set(leaf, "leaf-id");
function update(entry: Entry, value: string, count: number): void {
  entry.value = value;
  entry.count = count;
  console.log(index.get(entry), entry.value, entry.count);
}
update(branch, "updated-branch", 10);
update(leaf, "updated-leaf", 20);
console.log(branch.value, branch.count, leaf.value, leaf.count);

// Receiver evaluation precedes the RHS and is not repeated per union arm.
let trace: string[] = [];
let current: Entry = branch;
function receiver(): Entry { trace.push("receiver"); return current; }
function replacement(): string { trace.push("rhs"); current = leaf; return "snapshot"; }
receiver().value = replacement();
console.log(trace.join(","), branch.value, leaf.value);

// An exception in the RHS leaves the selected record unchanged.
function fail(): string { trace.push("throw"); throw new Error("write-failed"); }
try { receiver().value = fail(); } catch (error) {
  if (error instanceof Error) console.log(error.message, leaf.value);
}
console.log(trace.join(","));

// Nested common fields retain their objects; no structural copy is introduced.
interface TextNode { kind: "text"; next: Entry; text: string }
interface NumberNode { kind: "number"; next: Entry; number: number }
type Node = TextNode | NumberNode;
const text: TextNode = { kind: "text", next: branch, text: "t" };
const number: NumberNode = { kind: "number", next: leaf, number: 9 };
function replace(node: Node, next: Entry): void { node.next = next; }
replace(text, leaf);
replace(number, branch);
console.log(index.get(text.next), index.get(number.next));

// An array-read union narrowed by an undefined guard still mutates its arm.
const entries: Entry[] = [branch, leaf];
for (const entry of entries) {
  if (entry !== undefined) entry.value = "array-write";
}
console.log(branch.value, leaf.value);

// A missing unchecked array read retains its undefined arm until the write.
// JavaScript evaluates the RHS before PutValue raises the property error.
let missingEffects = 0;
function missingValue(): string { missingEffects++; return "unwritten"; }
try { entries[99].value = missingValue(); } catch (error) {
  if (error instanceof Error) console.log(error.name, error.message, missingEffects);
}
