let trace = "";
class Counter {
  stored = 1;
  get value(): number { trace += "get;"; return this.stored; }
  set value(value: number) { trace += "set;"; this.stored = value; }
}
let current = new Counter();
const first = current;
function receiver(): Counter { trace += "receiver;"; return current; }
function replacement(): number { trace += "rhs;"; current = new Counter(); return 4; }
console.log(receiver().value += replacement(), first.stored, current.stored, trace);
trace = "";
console.log(receiver().value = replacement(), current.stored, trace);
const record = { a: 1, nested: { value: 2 }, text: "a" };
console.log(record.a = 7, record.nested.value *= 3, record.text += "b");
console.log(JSON.stringify(record));
const key = Symbol("value");
class Keyed {
  [key] = 2;
}
const keyed = new Keyed();
console.log(keyed[key] += 5, keyed[key]);
let sideEffects = 0;
function fail(): number { sideEffects++; throw new Error("failed rhs"); }
try { console.log(record.a += fail()); }
catch (e) { if (e instanceof Error) console.log(e.message, record.a, sideEffects); }
