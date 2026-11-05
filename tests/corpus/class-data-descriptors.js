class Point {
  constructor(x) {
    this.x = x;
    const result = Object.defineProperty(this, 'id', { value: x + 10 });
    console.log(result === this);
    Object.defineProperties(this, {
      label: { value: 'point', enumerable: true, configurable: true, writable: true },
      meta: { value: { count: 1 }, configurable: true },
    });
  }
}
class Child extends Point {}
const point = new Point(2);
const child = new Child(3);
console.log(point.id, child.id, point.label, point.meta.count);
console.log(Object.keys(point).join(','), Object.hasOwn(point, 'id'));
const id = Object.getOwnPropertyDescriptor(point, 'id');
console.log(id.value, id.writable, id.enumerable, id.configurable);
point.meta.count = 4;
point.label = 'changed';
console.log(point.meta.count, child.meta.count, point.label);
try { point.id = 7; } catch (error) { console.log(error instanceof TypeError); }
try { Object.defineProperty(point, 'id', { value: 9 }); } catch (error) { console.log(error instanceof TypeError); }
const returned = Object.defineProperties(point, { label: { value: 'final', writable: false } });
console.log(returned === point, point.label);
const label = Object.getOwnPropertyDescriptor(point, 'label');
console.log(label.value, label.writable, label.enumerable, label.configurable);
/** @param {unknown} value */
function stringify(value) { return JSON.stringify(value); }
console.log(stringify(point));
function read(value) { return value.id + ':' + value.label; }
console.log(read(point), read(child));
const empty = Object.getOwnPropertyDescriptor(point, 'missing');
console.log(empty === undefined);
const events = [];
function target() { events.push('target'); return point; }
function description() { events.push('value'); return 5; }
Object.defineProperty(target(), 'extra', { value: description(), enumerable: true });
console.log(events.join(','), point.extra);
// Snapshot/commit operations must retain nonenumerable descriptors too.
/** @param {unknown} value */
function merge(value) { Object.assign(value, { label: 'blocked' }); }
try { merge(point); } catch (error) { console.log(error instanceof TypeError); }
console.log(point.id, Object.getOwnPropertyDescriptor(point, 'id').writable);
/** @param {unknown} value */
function extend(value) { Object.assign(value, { extra2: 7 }); }
extend(point);
console.log(point.extra2, point.id, Object.getOwnPropertyDescriptor(point, 'id').enumerable);
class Cycle {
  constructor() { this.x = 1; Object.defineProperty(this, 'self', { value: this }); }
}
function cycle() {
  const value = new Cycle();
  console.log(value.self === value, Object.keys(value).join(','));
}
cycle();
