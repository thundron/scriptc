console.log(Object.getOwnPropertyDescriptor(true, 'x'));
console.log(Object.getOwnPropertyDescriptor(7, 'x'));
const text = Object.getOwnPropertyDescriptor('abc', '1');
console.log(text.value, text.writable, text.enumerable, text.configurable);
const length = Object.getOwnPropertyDescriptor('abc', 'length');
console.log(length.value, length.writable, length.enumerable, length.configurable);
function item(value) { return value; }
item[1] = 'first';
item[1] = 'second';
const own = Object.getOwnPropertyDescriptor(item, '1');
console.log(own.value, own.writable, own.enumerable, own.configurable);
Object.defineProperty(item, 'fixed', { value: 42, enumerable: false, writable: false, configurable: false });
const fixed = Object.getOwnPropertyDescriptor(item, 'fixed');
console.log(item['fixed'], fixed.value, fixed.writable, fixed.enumerable, fixed.configurable);
