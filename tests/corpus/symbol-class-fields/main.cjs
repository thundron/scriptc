const { EventEmitter } = require("node:events");
const { inspect } = require("node:util");
const { Counter, countKey } = require("./counter.cjs");

var brand = Symbol.for("@opentui/core/Renderable");
const sameBrand = Symbol.for("@opentui/core/Renderable");
let textBrand = Symbol.for("@opentui/core/TextNodeRenderable");
const label = Symbol.for("label");
const sameLabel = Symbol.for("label");
const anon = Symbol();
const order = [];

class Base extends EventEmitter {
  [brand] = true;
  id = 1;
}
class Derived extends Base {
  [textBrand] = true;
  [sameBrand] = false;
}
const value = new Derived();
console.log(value[brand], value[sameBrand], value[textBrand], value.id);
value[sameBrand] = true;
console.log(value[brand], value instanceof EventEmitter);

class Fields {
  [brand] = (order.push("first"), true);
  name = (order.push("name"), "fields");
  [label] = (order.push("label"), "hello");
  [sameBrand] = (order.push("replace"), false);
  [sameLabel] = (order.push("replace-label"), "updated");
  [anon] = (order.push("anon"), 3);
}
const fields = new Fields();
console.log(order.join(","));
console.log(inspect(fields));
fields[anon] += 2;
console.log(fields[anon]++, ++fields[anon], fields[sameBrand]);

// Equal registry keys from separate modules must route to one slot.
const localCount = Symbol.for("scriptc.counter");
const counter = new Counter();
console.log(counter[countKey], counter[localCount], counter.bump());
counter[localCount] = 10;
console.log(counter[countKey], counter.bump(), inspect(counter));

// A binding with the same spelling in a nested scope is independent.
function shadow(brand) {
  brand = 42;
  return brand;
}
console.log(shadow(0), value[brand]);

// Symbol slots are excluded from the object's string-keyed view.
function stringProperties(value) {
  console.log(Object.keys(value).join(","));
  console.log(JSON.stringify(value));
}
stringProperties(fields);
