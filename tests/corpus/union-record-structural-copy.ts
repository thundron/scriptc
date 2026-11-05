// @transform-types
class Source { constructor(readonly name: string) {} }
interface Dependency { pos: number; dep: Source }
interface Failure { pos: number; crash: { message: string } }
interface Step { pos: number; dep?: Source; crash?: { message: string } }
const source = new Source("dependency");
const dependencies: Dependency[] = [{ pos: 3, dep: source }, { pos: 1, dep: source }];
const failures: Failure[] = [{ pos: 2, crash: { message: "failure" } }];
const mixed: (Dependency | Failure)[] = [...dependencies, ...failures];
const steps: Step[] = mixed.slice().sort((a, b) => a.pos - b.pos);
for (const step of steps) {
  console.log(step.pos, step.dep?.name ?? "none", step.crash?.message ?? "none");
}
console.log(steps[0]!.dep === source, steps[2]!.dep === source);
console.log(steps[1]!.crash === failures[0]!.crash);

interface ScalarRow { kind: string; value: string }
interface ArrayRow { kind: string; items: number[] }
interface Row { kind: string; value?: string; items?: number[] }
const values: (ScalarRow | ArrayRow)[] = [
  { kind: "scalar", value: "kept" },
  { kind: "array", items: [1, 2] },
];
const rows: Row[] = values;
console.log(rows[0]!.value, rows[0]!.items === undefined);
console.log(rows[1]!.value === undefined, rows[1]!.items?.join(","));
rows[1]!.items!.push(3);
console.log((values[1] as ArrayRow).items.join(","));

interface Nested { children: Row[] }
interface NestedSource { children: (ScalarRow | ArrayRow)[]; extra: string }
function nested(source: NestedSource): Nested { return source; }
const copy = nested({ children: values, extra: "dropped" });
console.log(copy.children[0]!.value, copy.children[1]!.items?.length);

interface A { id: number; child?: A | B; a: string }
interface B { id: number; child?: A | B; b: number }
interface Common { id: number; child?: Common; a?: string; b?: number }
const leaf: B = { id: 2, b: 8 };
const tree: A = { id: 1, a: "root", child: leaf };
const roots: (A | B)[] = [tree, leaf];
const common: Common[] = roots;
console.log(common[0]!.a, common[0]!.child?.b, common[1]!.b);
console.log(common[1]!.a === undefined, common[0]!.b === undefined);

let calls = 0;
function supplied(): (ScalarRow | ArrayRow)[] { calls++; return values; }
function consume(input: Row[]): string {
  return input.map(row => row.kind).join(",");
}
console.log(consume(supplied()), calls);
console.log(consume([]), calls);
