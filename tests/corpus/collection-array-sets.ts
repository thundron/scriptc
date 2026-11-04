// @transform-types
function item(value: number): Set<number> { return new Set([value, value + 1]); }
function values(sets: Set<number>[]): string {
  return sets.map((set) => [...set].join(":")).join(",");
}
const first = item(1);
const second = item(3);
const third = item(5);
const sets: Set<number>[] = [first, second];
sets.push(third);
console.log(values(sets), sets[0] === first, sets.includes(second));
console.log(sets.indexOf(first), sets.includes(item(1)));
first.add(9);
console.log(values(sets));
sets[1] = first;
console.log(values(sets), sets[0] === sets[1], second.size);
console.log(sets.pop() === third, values(sets));
sets.unshift(second, third);
console.log(values(sets), sets.shift() === second);
const removed = sets.splice(1, 1, second);
console.log(values(removed), values(sets));
const copied = sets.slice();
const spread = [...sets];
const combined = sets.concat([first]);
console.log(values(copied), values(spread), values(combined));
copied[0].add(11);
console.log(values(sets));
sets.reverse();
console.log(values(sets));
sets.fill(second, 1);
sets.copyWithin(0, 1);
console.log(values(sets));
const made = [10, 20, 30].map((value) => item(value));
const selected = made.filter((set) => set.has(20));
console.log(values(made), values(selected), selected[0] === made[1]);
console.log(made.find((set) => set.has(30)) === made[2]);
console.log(made.reduce((sum, set) => sum + set.size, 0));
console.log(values([made, [first]].flat()));
const expanded = made.flatMap((set) => [set, set]);
console.log(values(expanded), expanded[0] === expanded[1]);
console.log(values(Array.from(made)));

class Key { constructor(public name: string) {} }
const key = new Key("kept");
const referenceSets: Set<Key>[] = [new Set<Key>()];
referenceSets[0].add(key);
const alias = referenceSets.slice();
referenceSets[0].clear();
console.log(alias[0].has(key));
alias[0].add(key);
console.log(referenceSets[0].has(key));

const optional: (Set<number> | undefined)[] = [first, undefined, second];
for (const set of optional) console.log(set === undefined ? -1 : set.size);
console.log(optional[0] === first, optional[1] === undefined);
