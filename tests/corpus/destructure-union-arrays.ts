function show(row: number[] | string[]): void {
  const [first, , third = "default"] = row;
  console.log(first, third);
}
show([1, 2, 3]);
show(["a"]);
show([]);
const holes = [1, , 3] as number[];
show(holes);
let defaults = 0;
function fallback(): string { defaults++; return "fallback"; }
function values(row: number[] | string[]): void {
  const [first = fallback(), second = fallback()] = row;
  console.log(first, second, defaults);
}
values([0, 1]);
values([""]);
values([]);

function nested(row: number[][] | string[]): void {
  const [first] = row;
  if (Array.isArray(first)) first.push(9);
  else console.log(first);
}
const original = [1, 2];
const source = [original];
nested(source);
console.log(original.join(","));
nested(["text"]);
