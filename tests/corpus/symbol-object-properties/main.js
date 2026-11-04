const key = Symbol.for("property");
const different = Symbol("property");
const method = Symbol.for("method");
const base = {
  title: "base",
  [key]: 1,
  [different]: 2,
  [method]() { return this.title; },
};
console.log(base[key], base[different], base[Symbol("property")]);
base[key] = 3;
console.log(base[key], base[method]());
const child = Object.create(base);
child.title = "child";
console.log(child[key], child[method]());
child[key] = 4;
console.log(child[key], base[key]);
console.log(Object.keys(base).join(","), JSON.stringify(base));
const accessor = Symbol("accessor");
Object.defineProperty(base, accessor, {
  get() { return this.title; },
  set(value) { this.title = value; },
  configurable: true,
});
console.log(child[accessor]);
child[accessor] = "changed";
console.log(child.title, base.title);
console.log(key in child, different in child, Symbol("missing") in child);
console.log(child.hasOwnProperty(key), child.hasOwnProperty(different));
console.log(base.propertyIsEnumerable(key), base.propertyIsEnumerable(accessor));
const descriptor = Object.getOwnPropertyDescriptor(base, key);
console.log(descriptor.value, descriptor.writable, descriptor.enumerable, descriptor.configurable);
const copied = { ...base };
console.log(copied[key], copied[different], copied[method]());
const assigned = Object.assign({}, base);
console.log(assigned[key], assigned[different]);
function remove(object, property) { delete object[property]; }
remove(child, key);
console.log(child[key], child.hasOwnProperty(key));
remove(base, different);
console.log(different in base);
const iterator = Symbol.iterator;
console.log(iterator === Symbol.iterator, iterator === Symbol.for("Symbol.iterator"));
console.log(iterator.description, Symbol.keyFor(iterator));
console.log(Object.getOwnPropertySymbols(base).map(symbol => symbol.description).join(","));
console.log(Object.getOwnPropertyDescriptors(base)[key].value, Object.hasOwn(base, key));
Object.freeze(base);
console.log(Object.isFrozen(base), Object.isSealed(base));
try { base[key] = 9; } catch (error) { console.log(error.name); }
console.log(base[key]);
const fromEntries = Object.fromEntries;
const rebuilt = fromEntries([[key, "symbol"], ["plain", "string"]]);
console.log(rebuilt[key], rebuilt.plain, fromEntries === Object.fromEntries);
