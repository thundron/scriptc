var define = Object.defineProperty;
var descriptor = Object.getOwnPropertyDescriptor;
var keys = Object.keys;
var values = Object.values;
var entries = Object.entries;
var defineMany = Object.defineProperties;
const target = {};
const alias = target;
let value = 2;
define(target, "value", { get: () => value, set: next => { value = next; }, enumerable: true, configurable: true });
console.log(alias === target, alias.value, keys(alias).join(","));
alias.value = 9;
console.log(value, values(target).join(","), entries(target)[0].join(":"));
const desc = descriptor(target, "value");
console.log(typeof desc.get, typeof desc.set, desc.enumerable, desc.configurable);
defineMany(target, { name: { value: "renderer", enumerable: true } });
console.log(target.name, keys(target).join(","), define === Object.defineProperty);
console.log(descriptor(target, "missing") === undefined);
try { define(target, "name", { value: "changed" }); }
catch (error) { console.log(error.name); }
