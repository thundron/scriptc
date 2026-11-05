const events = [];
class Entry { constructor() { this.value = 7; } }
const registry = { item: Entry };
registry.item = Entry;
console.log(registry.item === Entry, new registry.item().value);
const data = { get Entry() { events.push("getter"); return Entry; } };
const unused = { Entry: data.Entry };
class Target {}
Object.defineProperty(Target.prototype, "selected", {
  set(value) { events.push("setter:" + value.name); },
});
Target.prototype.selected = Entry;
const noPrototype = { __proto__: null, Entry };
console.log(Object.getPrototypeOf(noPrototype) === null, new noPrototype.Entry().value);
const frozen = Object.freeze({ Entry });
console.log(Object.isFrozen(frozen), frozen.Entry === Entry);
console.log(events.join(","));
