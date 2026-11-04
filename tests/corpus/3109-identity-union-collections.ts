interface Leaf { kind: "leaf"; value: number }
interface Branch { kind: "branch"; children: Tree[] }
type Tree = Leaf | Branch;
const first: Leaf = { kind: "leaf", value: 3 };
const second: Leaf = { kind: "leaf", value: 3 };
const branch: Branch = { kind: "branch", children: [first, second] };
const index = new Map<Tree, number>([[first, 1], [branch, 2]]);
const firstView: Tree = first;
console.log(index.get(first), index.get(firstView), index.has(second));
function read(key: Tree): number { return index.get(key) ?? -1; }
console.log(read(first), read(branch), read(second));
function overwrite(key: Tree): void {
  if (key.kind === "leaf") index.set(key, key.value * 10);
  else index.set(key, key.children.length);
}
overwrite(firstView);
overwrite(branch);
console.log(index.size, read(first), read(branch));
for (const key of index.keys()) console.log(key.kind, read(key), key === firstView);
console.log(index.delete(first), index.has(firstView), index.delete(firstView));
index.set(firstView, 7);
console.log([...index.values()].join(","));

const all = new Set<Tree>([first, branch, firstView, second]);
console.log(all.size, all.has(first), all.has(firstView), all.has(branch));
const array = [...all];
console.log(array.length, array[0] === first, array[1] === branch, array[2] === second);
first.value = 99;
console.log(array.map((key) => key.kind === "leaf" ? String(key.value) : "branch").join(","));
all.delete(firstView);
all.add(first);
console.log([...all].map((key) => key.kind).join(","));
const visited: string[] = [];
all.forEach((value, duplicate) => {
  visited.push(value.kind + ":" + (value === duplicate));
});
console.log(visited.join(","));

const leaves = new Set<Leaf>([first, second, first]);
console.log(leaves.size, leaves.has(first), leaves.has({ kind: "leaf", value: 99 }));
const same = new Set<Leaf>([first]);
console.log([...leaves.intersection(same)].length, leaves.isSupersetOf(same));
console.log([...leaves.difference(same)][0] === second);
const symmetric = leaves.symmetricDifference(new Set<Leaf>([second]));
console.log(symmetric.size, symmetric.has(first));

const many: Leaf[] = [];
for (let i = 0; i < 120; i++) many.push({ kind: "leaf", value: i });
const grown = new Map<Tree, number>();
for (const leaf of many) grown.set(leaf, leaf.value);
for (let i = 0; i < many.length; i += 2) grown.delete(many[i]!);
for (let i = 0; i < many.length; i += 2) grown.set(many[i]!, -i);
let total = 0;
for (const leaf of many) total += grown.get(leaf) ?? 10000;
console.log(grown.size, total, grown.get(many[0]!), grown.get(many[119]!));
console.log([...grown.keys()].map((key) => key.kind === "leaf" ? key.value : -1).slice(0, 3).join(","));

type Wider = Tree | number[];
const wider = new Map<Wider, string>();
wider.set(firstView, "leaf");
wider.set(branch, "branch");
const list = [1, 2];
wider.set(list, "list");
console.log(wider.get(first), wider.get(firstView), wider.get(list), wider.size);

// A seeded container snapshots its outer iterable while keeping each
// element's original identity, including through array/tuple views.
const seedArray: readonly Tree[] = [first, branch, firstView];
const fromArray = new Set<Tree>(seedArray);
console.log(fromArray.size, fromArray.has(first), fromArray.has(branch));
const seedTuple: readonly [Leaf, Leaf] = [first, second];
const fromTuple = new Set<Leaf>(seedTuple);
console.log(fromTuple.size, fromTuple.has(first), fromTuple.has(second));
const overlap = fromArray.intersection(new Set<Tree>([firstView, second]));
console.log(overlap.size, overlap.has(first), overlap.has(branch));
const combined = fromArray.union(new Set<Tree>([second]));
console.log(combined.size, fromArray.isSubsetOf(combined), combined.isSupersetOf(fromArray));
const disjoint = new Set<Tree>([second]);
console.log(fromArray.isDisjointFrom(disjoint), fromArray.isDisjointFrom(overlap));
