class Counter {
  value: number;
  callback: (increment: number) => number;
  constructor(value: number) { this.value = value; this.callback = this.add; }
  add(increment: number): number { this.value += increment; return this.value; }
  constant(): number { return 11; }
  fail(): number { throw new Error("callback failed"); }
}
const first = new Counter(1);
const second = new Counter(10);
console.log(first.callback(2));
second.callback = first.callback;
console.log(second.callback(3), first.value);
console.log(first.callback === first.add, first.add === second.add);
const detached = first.callback;
try { detached(1); } catch (error) { if (error instanceof Error) console.log(error.name); }
const constant = first.constant;
console.log(constant());
const arrow = (value: number): number => value + 1;
const alias = arrow.bind(null);
const ordinary = (function(value: number): number { return value + 2; }).bind(null);
console.log(alias(4), ordinary(4));
const bound = first.add.bind(second);
console.log(bound(2), second.value, first.value);
console.log(first.add.call(second, 1), first.add.apply(first, [4]));
try { first.fail.bind(first)(); } catch (error) { if (error instanceof Error) console.log(error.message); }
console.log(bound(1));
