// @transform-types
function item(value: number): Map<string, number> {
  const map = new Map<string, number>();
  map.set("value", value);
  return map;
}
function values(maps: Map<string, number>[]): string {
  return maps.map((map) => map.get("value") ?? -1).join(",");
}

const first = item(1);
const second = item(2);
const third = item(3);
const maps: Map<string, number>[] = [first, second];
console.log(maps.length, maps[0] === first, maps[1] === second);
console.log(maps.push(third), values(maps));
console.log(maps.indexOf(second), maps.includes(first), maps.includes(item(1)));
first.set("value", 10);
console.log(values(maps));
maps[1] = first;
console.log(values(maps), maps[0] === maps[1], second.get("value"));
const popped = maps.pop();
console.log(popped === third, popped?.get("value"), values(maps));
console.log(maps.unshift(second, third), values(maps));
console.log(maps.shift() === second, values(maps));

const sliced = maps.slice(1);
const copied = [...maps];
const combined = maps.concat([second]);
console.log(values(sliced), values(copied), values(combined));
copied[0].set("value", 30);
console.log(values(maps), values(combined));
const removed = maps.splice(1, 1, second);
console.log(values(removed), values(maps), removed[0] === first);
maps.reverse();
console.log(values(maps));
maps.sort((a, b) => (a.get("value") ?? 0) - (b.get("value") ?? 0));
console.log(values(maps));
maps.fill(first, 1);
console.log(values(maps));
maps.copyWithin(0, 1);
console.log(values(maps));

const made = [5, 6, 7].map((value) => item(value));
const selected = made.filter((map) => (map.get("value") ?? 0) > 5);
console.log(values(made), values(selected), selected[0] === made[1]);
console.log(made.find((map) => map.get("value") === 6) === made[1]);
console.log(made.reduce((sum, map) => sum + (map.get("value") ?? 0), 0));
const flattened = [made, [first]].flat();
console.log(values(flattened), flattened[0] === made[0]);
const expanded = made.flatMap((map) => [map, map]);
console.log(values(expanded), expanded[0] === expanded[1]);
const from = Array.from(made);
console.log(values(from), from[2] === made[2]);

// Scope-stack shape used by the compiler: arrays of reference-keyed maps.
class Key { constructor(public name: string) {} }
interface Binding { value: number }
const key = new Key("x");
const binding: Binding = { value: 4 };
const scopes: Map<Key, Binding>[] = [new Map<Key, Binding>()];
scopes[0].set(key, binding);
scopes.push(new Map<Key, Binding>());
scopes[1].set(key, { value: 8 });
console.log(scopes[0].get(key)?.value, scopes[1].get(key)?.value);
const tail = scopes.splice(1);
console.log(scopes.length, tail[0].get(key)?.value);
scopes.push(...tail);
binding.value = 12;
console.log(scopes[0].get(key)?.value, scopes.pop()?.get(key)?.value);

const optional: (Map<string, number> | undefined)[] = [first, undefined, second];
for (const map of optional) console.log(map === undefined ? "missing" : map.get("value"));
console.log(optional[0] === first, optional[1] === undefined);
