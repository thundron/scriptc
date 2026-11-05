const object = JSON.parse("{}");
Object.defineProperty(object, "fixed", { value: 1 });
Object.defineProperty(object, "free", { value: 2, configurable: true });

delete object.fixed;
console.log(Object.hasOwn(object, "fixed"), object.fixed);

function strictDelete(target) {
  "use strict";
  delete target.fixed;
}
try {
  strictDelete(object);
} catch (error) {
  console.log(error.name);
}
console.log(Object.hasOwn(object, "fixed"));

delete object.free;
console.log(Object.hasOwn(object, "free"));
