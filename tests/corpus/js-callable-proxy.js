const events = [];
const target = (a, b) => a + b;
target.label = "sum";
const handler = {
  apply(fn, receiver, values) {
    events.push(this === handler, fn === target, receiver === undefined, values.join(","));
    return values[0] * values[1];
  },
  get(fn, key) { return key === "label" ? "product" : Reflect.get(fn, key); },
};
const proxy = new Proxy(target, handler);
console.log(typeof proxy, typeof proxy === "function", typeof proxy === "object", proxy.label, proxy(3, 4), events.join("|"));
handler.apply = undefined;
console.log(proxy(3, 4));
/** @param {(a: number, b: number) => number} fn */
function callChecked(fn) { return fn(2, 5); }
console.log(callChecked(proxy));
/** @param {(a: number, b: number) => number} fn */
function checkedIdentity(fn) { return fn; }
const again = checkedIdentity(proxy);
console.log(again === proxy, again.label, again(2, 5));
class FunctionState {
  constructor() { this.options = { value: 1 }; }
  configure(options) { this.options.value = options.value; return this; }
  once(value = null) { this.options.value = value; return this; }
  async onceAsync(value = null) { this.options.value = value; return this; }
}
const state = new FunctionState();
const configured = new Proxy(target, { get(fn, key, receiver) { return Reflect.get(state, key, receiver); } });
const preserved = checkedIdentity(configured);
console.log(preserved.configure({ value: 9 }) === configured, preserved.options.value);
console.log(preserved.once() === configured, preserved.options.value);
console.log(preserved.once(7) === configured, state.options.value);
console.log(await preserved.onceAsync(8) === configured, state.options.value);
const other = new Proxy(target, { apply(fn, receiver, values) { return receiver.base + values[0]; } });
const owner = { base: 10, other };
console.log(owner.other(5));
try { new Proxy(target, { apply: 1 })(2, 3); } catch (error) { console.log(error.name); }
try { new Proxy(target, { apply() { throw new Error("trap"); } })(); } catch (error) { console.log(error.message); }
