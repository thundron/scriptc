const order = [2, 0, 1];
const mapped: number[] = new Array<number>(3).fill(-1);
order.forEach((oldIndex, newIndex) => { mapped[oldIndex] = newIndex; });
console.log(mapped.join(","));

const candidates = new Map<string, number[]>();
candidates.set("entry", [1, 2]);
const included = new Array<boolean>(3).fill(false);
for (const candidate of candidates.get("entry") ?? new Array<number>()) {
  if (included[candidate] !== true) included[candidate] = true;
}
console.log(included.join(","));
