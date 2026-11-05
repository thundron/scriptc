// @transform-types
interface CycleNode {
  value: number;
  maps: Map<string, CycleNode>[];
  sets: Set<CycleNode>[];
  keyMaps: Map<CycleNode, number>[];
}

function cycle(value: number): number {
  const node: CycleNode = { value, maps: [], sets: [], keyMaps: [] };
  const values = new Map<string, CycleNode>();
  const keys = new Map<CycleNode, number>();
  const members = new Set<CycleNode>();
  node.maps.push(values);
  node.sets.push(members);
  node.keyMaps.push(keys);
  values.set("self", node);
  members.add(node);
  keys.set(node, value + 1);
  const copied = node.maps.slice();
  const spread = [...node.sets];
  const retained = node.keyMaps.concat(node.keyMaps);
  if (copied[0].get("self") !== node || !spread[0].has(node)) throw new Error("identity lost");
  const total = (retained[1].get(node) ?? 0) + (values.get("self")?.value ?? 0);
  // All three collections still point back through the owning record's
  // arrays when the function returns. Sanitizers must observe no leak.
  return total;
}
let total = 0;
for (let index = 0; index < 200; index++) total += cycle(index);
console.log(total);

class Owner {
  maps: Map<string, Owner>[] = [];
  sets: Set<Owner>[] = [];
  constructor(public value: number) {}
  link(other: Owner): void {
    this.maps.push(new Map<string, Owner>([["peer", other]]));
    this.sets.push(new Set([other]));
  }
}
function pair(value: number): number {
  const left = new Owner(value);
  const right = new Owner(value + 1);
  left.link(right);
  right.link(left);
  const copied = [left.maps, right.maps].flat();
  const filtered = left.sets.filter((set) => set.has(right));
  if (copied[0].get("peer") !== right || !filtered[0].has(right)) throw new Error("peer lost");
  return left.value + right.value;
}
let pairs = 0;
for (let index = 0; index < 200; index++) pairs += pair(index);
console.log(pairs);

// Clearing, replacing, and truncating array slots releases only their
// owned references; aliases keep the collection and its payload alive.
function release(): number {
  const node: CycleNode = { value: 42, maps: [], sets: [], keyMaps: [] };
  const map = new Map<string, CycleNode>([["self", node]]);
  node.maps.push(map, map);
  const alias = node.maps.slice();
  node.maps[0] = new Map<string, CycleNode>();
  node.maps.length = 0;
  const result = alias[0].get("self")?.value ?? 0;
  map.clear();
  return result;
}
console.log(release());
