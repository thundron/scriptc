class Entry {
  constructor(key, value) { this.key = key; this.value = value; }
  get 0() { console.log("key", this.key); return this.key; }
  get 1() { console.log("value", this.value); return this.value; }
}
const source = [new Entry("first", 1), new Entry("second", 2), new Entry("first", 3)];
const values = new Map(source);
console.log(values.size, values.get("first"), values.get("second"));
class Empty {}
const emptyEntries = new Map([new Empty(), new Empty()]);
console.log(emptyEntries.size, emptyEntries.has(undefined), emptyEntries.get(undefined));
const objects = [{ 0: "a", 1: 4 }, { 0: "b", 1: 5 }];
console.log(JSON.stringify([...new Map(objects)]));
try { new Map([7]); } catch (error) { console.log(error.name, error.message); }
