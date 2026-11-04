// @transform-types
class NodeView {
  reads = 0;
  writes = 0;
  value = "initial";
  constructor(readonly name: string, readonly child: NodeView | undefined) {}
  get body(): NodeView | undefined { this.reads++; return this.child; }
  get text(): string { this.reads++; return this.value; }
  set text(value: string) { this.writes++; this.value = value; }
}
class DerivedView extends NodeView {
  override get text(): string { this.reads++; return "derived:" + this.value; }
  override set text(value: string) { this.writes++; this.value = "set:" + value; }
}
function body(node: NodeView): NodeView | undefined {
  return (node as { body?: NodeView }).body;
}
function bracketBody(node: NodeView): NodeView | undefined {
  return (node as { body?: NodeView })["body"];
}
function read(node: NodeView): string {
  return (node as { readonly text: string }).text;
}
function write(node: NodeView, value: string): void {
  (node as { text: string }).text = value;
}
function bracketWrite(node: NodeView, value: string): void {
  (node as { text: string })["text"] = value;
}
const tail = new NodeView("tail", undefined);
const head = new NodeView("head", tail);
const derived = new DerivedView("derived", tail);
console.log(body(head) === tail, bracketBody(head) === tail, head.reads);
console.log(body(tail) === undefined, tail.reads);
console.log(body(derived) === tail, derived.reads);
console.log(read(head), read(derived));
write(head, "dot");
write(derived, "dot");
console.log(head.value, derived.value, head.writes, derived.writes);
bracketWrite(head, "bracket");
bracketWrite(derived, "bracket");
console.log(head["text"], derived["text"], head.writes, derived.writes);
console.log((head as { name?: string }).name, (head as { name?: string })["name"]);

let calls = 0;
function choose(): NodeView { calls++; return head; }
console.log((choose() as { body?: NodeView }).body === tail, calls);
console.log((choose() as { body?: NodeView })["body"] === tail, calls);
const key = "body";
console.log((choose() as { body?: NodeView })[key] === tail, calls);
(choose() as { text: string })["text"] = "once";
console.log(calls, head.value);

const list = [head];
console.log((list[0] as { body?: NodeView }).body === tail);
console.log((list[0] as { body?: NodeView })["body"] === tail);
try {
  console.log((list[2] as { body?: NodeView }).body === undefined);
} catch (error) {
  console.log("missing dot", error instanceof TypeError);
}
try {
  console.log((list[2] as { body?: NodeView })["body"] === undefined);
} catch (error) {
  console.log("missing bracket", error instanceof TypeError);
}

function optional(node: NodeView | undefined): NodeView | undefined {
  return (node as { body?: NodeView } | undefined)?.body;
}
console.log(optional(undefined) === undefined, optional(head) === tail);

class Count {
  gets = 0;
  sets = 0;
  private stored = 3;
  get amount(): number { this.gets++; return this.stored; }
  set amount(value: number) { this.sets++; this.stored = value; }
}
const count = new Count();
(count as { amount: number }).amount += 4;
console.log((count as { amount: number }).amount, count.gets, count.sets);

class Box<T> {
  constructor(readonly payload: T) {}
  get current(): T { return this.payload; }
}
function boxNumber(box: Box<number>): number { return (box as { current: number }).current; }
function boxString(box: Box<string>): string { return (box as { current: string })["current"]; }
console.log(boxNumber(new Box(42)), boxString(new Box("boxed")));

// Each assignment evaluates its receiver before its right-hand side.
const evaluation: string[] = [];
function receiver(): NodeView { evaluation.push("receiver"); return head; }
function replacement(): string { evaluation.push("value"); return "ordered"; }
(receiver() as { text: string })["text"] = replacement();
console.log(evaluation.join(","), head.value);

try {
  (list[2] as { text: string })["text"] = "missing";
} catch (error) {
  console.log("missing write", error instanceof TypeError);
}
