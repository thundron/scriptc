class Base {
  constructor(value) { this.value = value; }
}
class Child extends Base {
  constructor(value) {
    super(value);
    /** @type {?Base} */
    this.reference = null;
    this.ready = true;
    this.count = 2;
    this._value = value;
  }
  // @ts-expect-error JavaScript permits the base constructor to invoke this accessor.
  set value(value) {
    console.log("before", this.reference, this.ready, this.count);
    if (this.reference) this.reference.value = value;
    else this._value = value;
  }
  get value() { return this.reference ? this.reference.value : this._value; }
}
const child = new Child(3);
console.log("after", child.value, child.reference, child.ready, child.count);
child.value = 4;
console.log("updated", child.value);
class DeclaredChild extends Base {
  ready = true;
  ["count"] = 2;
  // @ts-expect-error JavaScript permits the base constructor to invoke this accessor.
  set value(value) { console.log("declared before", this.ready, this.count); this._value = value; }
  get value() { return this._value; }
}
const declared = new DeclaredChild(5);
console.log("declared after", declared.value, declared.ready, declared.count);
