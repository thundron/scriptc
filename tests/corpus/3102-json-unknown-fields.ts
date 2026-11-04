export {};

interface Node {
  kind: string;
  value?: unknown;
  nested?: { payload: unknown };
  children: Node[];
}
const root = JSON.parse('{"kind":"root","value":{"count":2},"nested":{"payload":[1,null,true]},"children":[{"kind":"leaf","children":[]}]}') as Node;
console.log(root.kind, JSON.stringify(root.value));
console.log(JSON.stringify(root.nested?.payload));
for (const child of root.children) console.log(child.kind, child.value === undefined, child.nested === undefined);

function visit(input: unknown): string[] {
  if (input === null || typeof input !== "object") return [];
  if (Array.isArray(input)) return input.flatMap(visit);
  const node = input as { kind?: unknown; value?: unknown };
  const names: string[] = [];
  if (typeof node.kind === "string") names.push(node.kind);
  for (const key of Object.keys(input)) {
    const child = (input as Record<string, unknown>)[key];
    names.push(...visit(child));
  }
  return names;
}
console.log(visit(root).join("|"));

// Opaque fields retain the subtree, including functions that a reviver
// returns. Validation checks the surrounding layout and typed siblings.
function add(value: number): number { return value + 1; }
const revived = JSON.parse('{"kind":"callable","value":0,"children":[]}',
  (key: string, value: unknown): unknown => key === "value" ? add : value) as Node;
console.log(revived.kind, (revived.value as (value: number) => number)(5));
const payload = JSON.parse('{"id":7,"opaque":{"x":1}}') as { id: number; opaque: unknown };
const again = payload.opaque as { x: number };
console.log(payload.id, again.x);
