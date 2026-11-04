class Value {
  constructor(value) { this.value = value; }
  read() { return this.value; }
}
function install(first, second) {
  return Value.prototype[first] = Value.prototype[second] = function (increment) {
    this.value += increment;
    return this.value;
  };
}
function read(object, key) { return object[key]; }
function call(object, key, value) { return object[key](value); }
const method = install('add', 'increase');
const left = new Value(2), right = new Value(10);
console.log(read(left, 'add') === method, read(left, 'add') === read(right, 'increase'));
console.log(call(left, 'add', 3), call(right, 'increase', 4), left.read(), right.read());
const descriptors = {};
descriptors.doubled = { get() { return this.value * 2; }, set(value) { this.value = value / 2; }, configurable: true };
Object.defineProperties(Value.prototype, descriptors);
console.log(read(left, 'doubled'), read(right, 'doubled'));
function write(object, key, value) { object[key] = value; }
write(left, 'doubled', 30);
console.log(left.read(), read(left, 'doubled'), Object.keys(left).join(','));
descriptors[0] = { get() { return this.value + 1; }, configurable: true };
Object.defineProperties(Value.prototype, descriptors);
console.log(left[0], right[0]);
