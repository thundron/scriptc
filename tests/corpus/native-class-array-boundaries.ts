class Plane {
  constant: number;
  constructor(value: number) { this.constant = value; }
}
function roundtrip(value: unknown): Plane[] { return value as Plane[]; }
function optional(value: unknown): Plane[] | null { return value as Plane[] | null; }
const plane = new Plane(2);
const planes = [plane];
const copy = roundtrip(planes);
console.log('array', copy.length, copy[0] === plane, copy[0].constant);
copy[0].constant = 4;
console.log('mutation', plane.constant, optional(planes)![0] === plane, optional(null) === null);
function boxedRecord(value: unknown) { return value; }
const boxed = boxedRecord({plane, planes});
const view = boxed as {plane: unknown; planes: unknown[]};
console.log('record', view.plane === plane, view.planes[0] === plane);
const callback: unknown = (value: Plane): number => value.constant;
console.log('callback', (callback as (value: Plane) => number)(plane));

class Tree {
  children: Tree[] = [];
  select: (node: Tree) => Tree[] = (node) => node.children;
}
const root = new Tree(), child = new Tree();
root.children.push(child);
const tree: unknown = root;
const restored = tree as Tree;
console.log('recursive', restored === root, restored.select(root)[0] === child);
console.log('view', Object.keys(tree as object).sort().join(','));
