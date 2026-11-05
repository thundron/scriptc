function make(raw) {
  let pointer = raw.pointer;
  const object = {
    get pointer() { return pointer; },
    set pointer(value) { pointer = value; },
    get alive() { return pointer !== null; },
    close() { pointer = null; },
  };
  return object;
}
const value = make(JSON.parse('{"pointer":42}'));
console.log(value.pointer, value.alive, Object.keys(value).join(','));
value.pointer = 99;
console.log(value.pointer);
value.close();
console.log(value.pointer, value.alive);
let calls = 0;
const key = JSON.parse('"x"');
const mixed = {get [key]() {calls++; return 7;}, [key]: 8};
console.log(mixed.x,calls);
const spread = {get x() {return 0;}, set x(value) {calls++;}, ...JSON.parse('{"x":10}')};
console.log(spread.x, calls, Object.getOwnPropertyDescriptor(spread, "x").writable);
spread.x = 11;
console.log(spread.x, calls);
const getterSpread = {get [key]() {throw new Error("replaced");}, ...JSON.parse('{"x":12}')};
console.log(getterSpread.x);
