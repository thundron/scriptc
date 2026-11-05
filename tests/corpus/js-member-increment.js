const values = [2, 8];
let receivers = 0, keys = 0;
function receiver() { receivers++; return values; }
function key() { keys++; return 1; }
console.log(receiver()[key()]++, values[1], ++receiver()[key()], receivers, keys);
values[0]--;
console.log(values[0]);
const bytes = new Uint8Array([255]);
console.log(++bytes[0], bytes[0], bytes[0]--, bytes[0]);
const record = { count: 3 };
console.log(record.count++, --record.count, record.count);
class Counter {
  constructor() { this.count = 4; this.events = []; }
  get value() { this.events.push('get'); return this.count; }
  set value(v) { this.events.push('set'); this.count = v; }
}
const counter = new Counter();
console.log(counter.value++, ++counter.value, counter.count, counter.events.join(','));
const dynamic = JSON.parse('{"value":"7"}');
console.log(dynamic.value++, dynamic.value, --dynamic.value);
const symbol = Symbol('slot');
dynamic[symbol] = 10n;
console.log(dynamic[symbol]++, ++dynamic[symbol], dynamic[symbol]);
let conversions = 0;
const computed = { toString() { conversions++; return 'value'; } };
console.log(dynamic[computed]++, dynamic.value, conversions);
dynamic.label = 'mesh';
console.log(dynamic.label += '_instance_' + dynamic.value++, dynamic.label, dynamic.value);
dynamic.value = '8';
console.log(dynamic.value -= 2, dynamic.value);
console.log(dynamic.value ^= 3, dynamic.value <<= 2, dynamic.value >>>= 1);
dynamic.value = 10n;
console.log(dynamic.value &= 7n, dynamic.value >>= 1n);
class Flags {
  constructor() { this.value = 0; }
  update(value) { this.value = value; return this.value ^= 3; }
}
const flags = new Flags();
console.log(flags.update(5), flags.value);
class Scale {
  /** @param {number} [value] */
  apply(value) { value *= 2; return value; }
}
const scale = new Scale();
console.log(scale.apply(3), scale.apply());
