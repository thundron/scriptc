class RecordValue {
  constructor(value) { this.value = value; }
  static read(object) { return object.value; }
  static label(object) { return this.read(object) + ":" + this.tag; }
  toJSON() { return this.constructor.label(this); }
}
RecordValue.tag = "base";
class Child extends RecordValue {}
Child.tag = "child";
const value = new Child("hello");
console.log(value.toJSON());
const read = Child.read;
console.log(read === RecordValue.read, read({ value: "detached" }));
console.log(Child.missing === undefined, Child.prototype.constructor === Child);
