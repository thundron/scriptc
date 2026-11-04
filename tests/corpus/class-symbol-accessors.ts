const key = Symbol.for("value");
class Box {
  value = 1;
  get [key]() { return this.value; }
  set [key](value: number) { this.value = value; }
}
function check(box: any): void {
  console.log(box[key], key in box, Object.hasOwn(box, key));
  box[key] = 42;
  console.log(box[key]);
}
check(new Box());
