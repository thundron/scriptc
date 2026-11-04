const key = Symbol("key");
class Base { inherited = 3; }
class Item extends Base {
  value = { count: 7 };
  [key] = "symbol";
  /** @returns {string} */
  get ignored() { throw new Error("prototype getter must not run"); }
}
function describe(value) {
  const descriptors = Object.getOwnPropertyDescriptors(value);
  console.log(Object.getOwnPropertyNames(value).join(","));
  console.log(Object.getOwnPropertySymbols(value).length);
  console.log(descriptors.value.value === value.value);
  console.log(descriptors.value.writable, descriptors.value.enumerable, descriptors.value.configurable);
  console.log(descriptors.inherited.value, descriptors[key].value);
}
const item = new Item();
describe(item);
function update(value) {
  Object.assign(value, { [key]: "changed" });
  return value[key];
}
console.log(update(item), item[key]);
