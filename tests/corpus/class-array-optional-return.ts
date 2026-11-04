// Optional return propagation updates the class's original method signature
// through its prepass registry, including forwarded calls and callbacks.
class Values {
  read(values: number[], index: number): number { return values[index]; }
  forward(values: number[], index: number): number { return this.read(values, index); }
  text(values: string[]): string { return values[2]; }
}
const values = new Values();
for (const index of [0, 1, 2]) {
  console.log(values.read([42], index));
  console.log(values.forward([42], index));
}
console.log(values.text(["one"]));
console.log(values.text(["one", "two", "three"]));
console.log([0, 1, 2].map((index) => values.forward([7], index)).join("|"));
