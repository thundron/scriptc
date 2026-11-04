class Base {
  constructor(value = 1) { this.x = value; }
  copy(value = 1) { return value; }
  clone(value) { return new this.constructor(value); }
}
class Child extends Base {
  /** @returns {string} */
  // @ts-expect-error JavaScript permits a different return type at runtime.
  copy(value) { console.log('child'); return String(value); }
}
const child = new Child(3);
console.log(child.copy(2), typeof child.copy(4), new Base().copy());
Object.defineProperty(child, 'data', { get() { return this.x; }, configurable: true, enumerable: true });
Object.defineProperties(child, { doubled: { get() { return this.x * 2; }, configurable: true } });
console.log(child.data, child.doubled, Object.keys(child).join(','));
child.x = 5;
console.log(child.data, child.doubled, Object.getOwnPropertyDescriptor(child, 'data').enumerable);
function replace(value, constructor) { value.constructor = constructor; }
function argument() { console.log('argument'); return 7; }
replace(child, Base);
const first = child.clone(argument());
console.log(first.x, first instanceof Base, first instanceof Child);
replace(child, Child);
const second = child.clone(argument());
console.log(second.x, second instanceof Base, second instanceof Child);
