const first = Symbol("first"), second = Symbol("second");
const value = { b: 1, 10: "ten", 2: "two", [first]: 3, a: 4, [second]: 5 };
Object.defineProperty(value, "hidden", { value: 6 });
const keys = Reflect.ownKeys;
console.log(Reflect.ownKeys(value).map((key) => String(key)).join(","));
console.log(keys(value).map((key) => String(key)).join(","), keys.length, keys.name);
console.log(keys([1, 2]).join(","));
for (const key of Reflect.ownKeys(value)) {
  console.log(String(key), value[key], Object.hasOwn(value, key));
  console.log(Object.prototype.hasOwnProperty.call(value, key), Object.prototype.propertyIsEnumerable.call(value, key));
  if (key !== "hidden") {
    value[key] = "updated";
    console.log(value[key]);
  }
}
for (const primitive of [undefined, null, "text", 3, true, 4n, first]) {
  try { keys(primitive); } catch (error) { console.log(error.name, error.message); }
}
