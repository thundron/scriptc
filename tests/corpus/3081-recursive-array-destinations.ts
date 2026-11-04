export {};

type Node = { kind: "leaf"; value: number } | { kind: "branch"; children: Node[]; alternate: Node[] | null };
function weight(nodes: Node[]): number {
  let result = 0;
  for (const node of nodes) {
    if (node.kind === "leaf") result += node.value;
    else result += weight(node.children) + (node.alternate === null ? 0 : weight(node.alternate));
  }
  return result;
}

let nodes: Node[] = [{ kind: "leaf", value: 1 }];
const original = nodes;
for (let depth = 0; depth < 5; depth++) {
  nodes = [{ kind: "branch", children: nodes, alternate: [{ kind: "branch", children: nodes, alternate: null }] }];
  console.log("weight", depth, weight(nodes));
}
original.push({ kind: "leaf", value: 2 });
console.log("aliased", weight(nodes));

function accept(values: Node[] | undefined): number {
  return values === undefined ? -1 : weight(values);
}
console.log("optional", accept([{ kind: "leaf", value: 7 }]), accept([]), accept(undefined));

let effects = "";
function value(n: number): number { effects += String(n); return n; }
function make(): { values: Node[] | null } {
  return { values: [{ kind: "leaf", value: value(3) }, { kind: "leaf", value: value(4) }] };
}
const wrapped = make();
console.log("return", wrapped.values === null ? 0 : weight(wrapped.values), effects);

// The unique tuple arm uses tuple storage rather than an array element ABI.
function pair(input: [number, string] | null): string {
  return input === null ? "none" : String(input[0]) + input[1];
}
console.log("tuple", pair([5, "five"]), pair(null));

// Several array arms remain distinguished by their actual literal type.
function separate(input: number[] | string[] | null): string {
  return input === null ? "null" : JSON.stringify(input);
}
console.log("ambiguous", separate([1, 2]), separate(["a", "b"]));
