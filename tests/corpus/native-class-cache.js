class Store {
  values = new Map();
  count = 0;
  put(key, value) { this.values.set(key, value); this.count++; return this; }
  get(key) { return this.values.get(key); }
  has(key) { return this.values.has(key); }
  clearCache() { this.values.clear(); }
  join(prefix, ...values) { return prefix + values.join(":"); }
  /** @param {...number} numbers */
  total(...numbers) { let result = 0; for (const number of numbers) result += number; return result; }
  countArgs(first) { return arguments.length; }
  noParams() { return arguments.length; }
  argumentAlias(first) { arguments[0] = 9; return first; }
  static countArgs(first) { return arguments.length; }
  describe(prefix = "store") { return `${prefix}:${this.count}`; }
  fail() { throw new Error("store failed"); }
}
const cacheKey = Symbol.for("scriptc.class-cache");
globalThis[cacheKey] = new Store();
const store = globalThis[cacheKey];
console.log(store.put("one", 3) === store, store.get("one"), store.has("one"));
console.log(store.describe(), store.describe("cached"));
console.log(store.join("items:", 1, "two", true), store.join("empty:"), store.countArgs(1, 2, 3));
console.log(store.noParams(1, 2), store.argumentAlias(4), Store.countArgs(1, 2, 3, 4));
console.log(store.total(1, 2, 3), store.total());
store.clearCache();
console.log(store.get("one") === undefined, store.has("one"));
try { store.fail(); } catch (error) { console.log(error.message); }
class Base {
  value = 4;
  describe() { return `base:${this.value}`; }
}
class Derived extends Base {
  describe() { return `derived:${this.value}`; }
}
globalThis[cacheKey] = new Derived();
console.log(globalThis[cacheKey].describe());
/** @type {Base} */
const base = new Derived();
globalThis[cacheKey] = base;
console.log(globalThis[cacheKey].describe());
class Factory {
  make() { return new Store(); }
}
globalThis[cacheKey] = new Factory();
const next = globalThis[cacheKey].make();
console.log(next.put("next", 8).get("next"));
let effects = "";
function receiver() { effects += "receiver;"; return next; }
function replace() { effects += "argument;"; globalThis[cacheKey] = new Store(); return "last"; }
console.log(receiver().put(replace(), 9) === next, next.get("last"), effects);
globalThis[cacheKey] = { describe() { return "plain"; } };
console.log(globalThis[cacheKey].describe());
delete globalThis[cacheKey];
