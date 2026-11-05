interface Owner {
  name: string;
  index?: Map<Owner, string>;
  members?: Set<Owner>;
}
function makeCycle(name: string): string {
  const owner: Owner = { name };
  owner.index = new Map<Owner, string>();
  owner.index.set(owner, "stored");
  owner.members = new Set<Owner>([owner]);
  const retained = [...owner.members];
  const again = retained[0]!;
  return again.name + ":" + again.index!.get(owner) + ":" + again.members!.has(owner);
}
for (let i = 0; i < 300; i++) makeCycle("temporary");
console.log(makeCycle("live"));

class Graph {
  edges = new Map<Graph, Graph>();
  members = new Set<Graph>();
  id: number;
  constructor(id: number) { this.id = id; }
}
function graph(): number {
  const first = new Graph(1);
  const second = new Graph(2);
  first.edges.set(second, first);
  second.edges.set(first, second);
  first.members.add(second);
  second.members.add(first);
  const saved = [...first.members];
  first.members.clear();
  return saved[0]!.edges.get(first)!.id;
}
for (let i = 0; i < 300; i++) graph();
console.log(graph());

interface Entry { name: string; peers?: Set<Entry[]> }
function arrayCycle(): number {
  const entry: Entry = { name: "entry" };
  const array: Entry[] = [entry];
  entry.peers = new Set<Entry[]>([array]);
  const copied = [...entry.peers];
  return copied[0] === array ? copied[0]!.length : -1;
}
for (let i = 0; i < 300; i++) arrayCycle();
console.log(arrayCycle());
