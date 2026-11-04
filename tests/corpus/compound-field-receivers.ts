let trace = "";
class Counter {
  count = 2;
  get value(): number { trace += "get;"; return this.count; }
  set value(value: number) { trace += "set;"; this.count = value; }
}
let active = new Counter();
const original = active;
function receiver(): Counter { trace += "receiver;"; return active; }
function replace(): number {
  trace += "rhs;";
  original.count = 100;
  active = new Counter();
  return 5;
}
receiver().value += replace();
console.log(trace, original.count, active.count);
trace = "";
const saved = active;
active.count += replace();
console.log(trace, saved.count, active.count);
const nested = { inner: { length: 1, label: "a" } };
nested.inner.length += 4;
nested.inner.label += "b";
console.log(nested.inner.length, nested.inner.label);
const rows = [{ count: 3 }];
rows[0]!.count *= 4;
console.log(rows[0]!.count);
let calls = 0;
function read(): Counter { calls++; return active; }
read().count++;
read().count **= 2;
console.log(calls, active.count);
try {
  receiver().value += (() : number => { trace += "throw;"; throw new Error("rhs"); })();
} catch (e) { console.log("caught", active.count, trace); }
