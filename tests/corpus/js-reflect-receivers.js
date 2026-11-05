const receiver = { value: 7 };
const target = {
  value: 2,
  get doubled() { return this.value * 2; },
  set doubled(value) { this.value = value / 2; },
};
console.log(Reflect.get(target, "value", receiver), Reflect.get(target, "doubled", receiver));
console.log(Reflect.set(target, "value", 9, receiver), target.value, receiver.value);
console.log(Reflect.set(target, "doubled", 30, receiver), target.value, receiver.value);
Object.defineProperty(target, "fixed", { value: 3, writable: false });
console.log(Reflect.set(target, "fixed", 4), Reflect.set(target, "doubled", 8), target.value);
Object.defineProperty(receiver, "blocked", { get() { return 1; } });
console.log(Reflect.set(target, "blocked", 4, receiver), Reflect.set(target, "value", 3, 1));
const locked = Object.preventExtensions({});
console.log(Reflect.set(target, "value", 4, locked));
const symbol = Symbol("key");
Object.defineProperty(target, symbol, { get() { return this.value; }, set(value) { this.value = value; } });
console.log(Reflect.get(target, symbol, receiver), Reflect.set(target, symbol, 11, receiver), receiver.value);
const proxy = new Proxy(target, {
  get(object, key, self) { return Reflect.get(object, key, self); },
  set(object, key, value, self) { return Reflect.set(object, key, value, self); },
});
console.log(Reflect.get(proxy, "doubled", receiver), Reflect.set(proxy, "doubled", 40, receiver), receiver.value);
class Counter {
  constructor(value) { this.value = value; }
  get doubled() { return this.value * 2; }
  set doubled(value) { this.value = value / 2; }
  method() { return this.value; }
}
const counter = new Counter(3);
console.log(Reflect.get(counter, "value"), Reflect.get(counter, "doubled", receiver));
console.log(Reflect.set(counter, "value", 5), counter.value, Reflect.set(counter, "doubled", 12, receiver), receiver.value);
console.log(Reflect.set(counter, "value", 8, receiver), counter.value, receiver.value);
const other = new Counter(4);
console.log(Reflect.set(counter, "value", 10, other), counter.value, other.value);
console.log(Reflect.get(counter, "method").call(other));
const callable = function () {};
callable.value = 5;
Object.defineProperty(callable, "doubled", { get() { return this.value * 2; } });
console.log(Reflect.get(callable, "doubled", receiver), Reflect.set(callable, "value", 6), callable.value);
const order = [];
function makeTarget() { order.push("target"); return target; }
function makeKey() { order.push("key"); return "value"; }
console.log(Reflect.get(makeTarget(), makeKey()), order.join(","));
for (const value of [null, undefined, 1, "a", true]) {
  try { Reflect.get(value, "value"); } catch (error) { console.log(error.name); }
  try { Reflect.set(value, "value", 1); } catch (error) { console.log(error.name); }
}
