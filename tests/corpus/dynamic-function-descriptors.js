function named(first, second) { return first + second; }
const alias = named;
for (const key of ['name', 'length', 'missing']) {
  const descriptor = Object.getOwnPropertyDescriptor(alias, key);
  if (descriptor) console.log(key, descriptor.value, descriptor.writable, descriptor.enumerable, descriptor.configurable);
  else console.log(key, descriptor);
}
Object.defineProperties(named, { label: { value: 'tag', writable: true, enumerable: true, configurable: true } });
const label = Object.getOwnPropertyDescriptor(alias, 'label');
console.log(label.value, label.writable, label.enumerable, label.configurable);
console.log(Object.getOwnPropertyDescriptor(alias, 'name').value);
console.log(Object.hasOwn(alias, 'name'), Object.hasOwn(alias, 'length'), Object.hasOwn(alias, 'label'), Object.hasOwn(alias, 'missing'));
const arrayLength = Object.getOwnPropertyDescriptor(JSON.parse('[1,2,3]'), 'length');
console.log(arrayLength.value, arrayLength.writable, arrayLength.enumerable, arrayLength.configurable);
