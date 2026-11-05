// The sanitizer/RC-audit lane must collect cycles through both nested Map
// values and Set values, including paths through nullable collection slots.
class Owner {
  name: string;
  groups: Map<string, Map<string, Owner>> = new Map<string, Map<string, Owner>>();
  sets: Map<string, Set<Owner>> = new Map<string, Set<Owner>>();
  constructor(name: string) { this.name = name; }
}

function nestedCycle(index: number): void {
  const owner = new Owner(`owner${index}`);
  const inner = new Map<string, Owner>();
  inner.set("self", owner);
  owner.groups.set("cycle", inner);
  const set = new Set<Owner>();
  set.add(owner);
  owner.sets.set("cycle", set);
  const nested = owner.groups.get("cycle")!;
  console.log(nested.get("self") === owner, owner.sets.get("cycle")!.has(owner));
  // Iteration roots keep nested values alive while callbacks mutate links.
  owner.groups.forEach((group) => {
    console.log(group.get("self")!.name);
    group.set("alias", owner);
  });
}
for (let index = 0; index < 3; index++) nestedCycle(index);

interface Link {
  value: number;
  nested: Map<number, Map<number, Link>> | undefined;
}
function nullableCycle(value: number): void {
  const link: Link = { value, nested: undefined };
  const first = new Map<number, Link>();
  const second = new Map<number, Map<number, Link>>();
  first.set(1, link);
  second.set(2, first);
  link.nested = second;
  console.log(link.nested.get(2)!.get(1) === link);
}
nullableCycle(7);

// Deleting the final outer entry destroys its inner map and its retained
// record. A different external alias keeps the same inner map alive.
function replaceCycle(): void {
  const owner = new Owner("replace");
  const inner = new Map<string, Owner>([["self", owner]]);
  owner.groups.set("self", inner);
  const alias = owner.groups.get("self")!;
  owner.groups.set("self", new Map<string, Owner>());
  console.log(alias.get("self") === owner, owner.groups.get("self")!.size);
  owner.groups.clear();
  alias.clear();
  console.log(owner.groups.size, alias.size);
}
replaceCycle();

// A Map key itself can close the cycle. Tracing just the inner map's
// values would miss this ownership path.
class KeyOwner {
  nested: Map<string, Map<KeyOwner, number>> = new Map<string, Map<KeyOwner, number>>();
}
function keyCycle(): void {
  const key = new KeyOwner();
  const inner = new Map<KeyOwner, number>();
  inner.set(key, 42);
  key.nested.set("inner", inner);
  console.log(key.nested.get("inner")!.get(key));
}
keyCycle();
