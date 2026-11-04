class Item {
  value: number;
  constructor(value: number) { this.value = value; }
  add(amount: number): number { this.value += amount; return this.value; }
}
const first = new Item(1);
const second = new Item(2);
const values: unknown = [first, second];
const nested: unknown = { items: [first], item: second };
function inspect(value: any, original: any): void {
  console.log(value[0] === original);
  console.log(value[0].add(4), value[1].value);
}
inspect(values, first);
function inspectNested(value: any, original: any): void {
  console.log(value.items[0] === original, value.item.add(3));
}
inspectNested(nested, first);
console.log(first.value, second.value);

class Failure extends Error {}
const failure = new Failure("failed");
const errors: unknown = [failure];
function inspectError(values: any, original: any): void {
  console.log(values[0] === original, values[0] instanceof Error, values[0].message);
}
inspectError(errors, failure);
