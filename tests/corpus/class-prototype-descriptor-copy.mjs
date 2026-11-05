class Item {
  value = 4;
  get doubled() { return this.value * 2; }
  set doubled(value) { this.value = value / 2; }
  add(amount) { this.value += amount; return this.value; }
  toJSON() { return { value: this.value }; }
}
const originalAdd = Item.prototype.add;
function copy(value) {
  const prototype = Object.getPrototypeOf(value);
  console.log(Object.getOwnPropertyNames(prototype).join(","));
  console.log(prototype.constructor === Item);
  const descriptors = Object.getOwnPropertyDescriptors(prototype);
  console.log(descriptors.add.enumerable, descriptors.add.writable, descriptors.add.configurable);
  console.log(descriptors.add.value === originalAdd);
  const result = Object.create(prototype, Object.getOwnPropertyDescriptors(value));
  console.log(result.doubled, result.add(2), value.value);
  result.doubled = 20;
  console.log(JSON.stringify(result), result.value, result.add === value.add);
  console.log(result instanceof Item, Object.create(null) instanceof Item);
  return result;
}
copy(new Item());
function isItem(value) { return value instanceof Item; }
console.log(isItem(null), isItem(3), isItem({}));

class SpecialItem extends Item {
  label() { return "special:" + this.value; }
}
function copySpecial(value) {
  const prototype = Object.getPrototypeOf(value);
  const result = Object.create(prototype, Object.getOwnPropertyDescriptors(value));
  const parent = Object.getPrototypeOf(prototype);
  console.log(Object.getOwnPropertyNames(parent).join(","));
  console.log(result.label(), result.add(1), result instanceof SpecialItem, result instanceof Item);
}
copySpecial(new SpecialItem());
