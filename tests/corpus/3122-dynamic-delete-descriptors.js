const object = JSON.parse("{}");
Object.defineProperty(object, "fixed", { value: 1 });
Object.defineProperty(object, "free", { value: 2, configurable: true });

try {
  delete object["fixed"];
} catch (error) {
  console.log(error.name);
}
console.log(Object.hasOwn(object, "fixed"), object.fixed);

delete object.free;
console.log(Object.hasOwn(object, "free"));
