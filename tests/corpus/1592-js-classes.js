// JavaScript classes: fields declared by CONSTRUCTOR ASSIGNMENT (checkJs
// infers the property types), methods, getters, single inheritance with a
// virtual override dispatched through a base-typed element.
'use strict';

class Shape {
  /** @param {string} name */
  constructor(name) {
    this.name = name;
    this.hits = 0;
  }
  area() {
    return 0;
  }
  describe() {
    this.hits += 1;
    return `${this.name}: ${this.area()}`;
  }
  get tag() {
    return this.name.toUpperCase();
  }
}

class Rect extends Shape {
  /** @param {number} w @param {number} h */
  constructor(w, h) {
    super("rect");
    this.w = w;
    this.h = h;
  }
  area() {
    return this.w * this.h;
  }
}

class Square extends Rect {
  /** @param {number} side */
  constructor(side) {
    super(side, side);
  }
}

const shapes = [new Shape("blob"), new Rect(3, 4), new Square(5)];
for (const s of shapes) console.log(s.describe(), s.tag);
const r = new Rect(2, 6);
r.describe();
r.describe();
console.log("hits:", r.hits, "square?", shapes[2] instanceof Square, shapes[1] instanceof Square);

// An unused incompatible JS override must not prevent construction or
// unrelated methods. A deeper compatible override still dispatches normally.
class ReturnBase {
  value = 10;
  insert(value, anchor) { return 1; }
  selected() { return "base"; }
  read() { return this.value; }
  dispatch(value) { return this.insert(value, undefined); }
}
class DormantReturns extends ReturnBase {
  constructor() { super(); this.value = 20; }
  // @ts-expect-error Exercise a valid JS override with a different return.
  insert(value, anchor) { console.log("unused", value, anchor); }
  // @ts-expect-error Exercise a valid JS override with a different return.
  selected() { return 42; }
}
class RepairedReturns extends DormantReturns {
  insert(value, anchor) { console.log("repaired", value, anchor); return 3; }
  // @ts-expect-error The deeper override matches the original base ABI.
  selected() { return "repaired"; }
}
class ShortDormantReturn extends ReturnBase {
  // @ts-expect-error Both the return type and the unused tail differ.
  insert(value) { console.log("unused short", value); }
}
const dormant = new DormantReturns();
console.log("dormant", dormant.read(), new ShortDormantReturn().read());
const repaired = new RepairedReturns();
console.log("repaired", repaired.dispatch("item"), repaired.selected());

// A null initializer does not restrict an inferred JS field to null forever.
class MutableNull {
  value = null;
  set(value) { this.value = value; }
  read() { return this.value; }
  get current() { return this.value; }
  set current(value) { this.value = value; }
}
class ResetNull extends MutableNull {
  value;
  constructor(value) {
    super();
    console.log('reset', this.value === undefined);
    this.value = value;
  }
}
class ConstructorNull {
  constructor() { this.value = null; }
  set(value) { this.value = value; }
  read() { return this.value; }
}
const mutableNull = new MutableNull();
console.log('null initial', mutableNull.read(), mutableNull.current);
mutableNull.set('updated');
console.log('null written', mutableNull.read(), mutableNull.current);
mutableNull.current = 42;
console.log('accessor', mutableNull.read());
console.log('numeric field', Number(mutableNull.value));
const resetNull = new ResetNull('derived');
console.log('inherited', resetNull.read());
const readMutableNull = () => mutableNull.value;
function readNullField() { return mutableNull.value; }
const savedNullReader = readNullField;
console.log('readers', readMutableNull(), savedNullReader());
const constructorNull = new ConstructorNull();
constructorNull.set('constructor');
console.log('constructor field', constructorNull.read());
mutableNull.set(null);
console.log('null reset', readMutableNull(), savedNullReader());
