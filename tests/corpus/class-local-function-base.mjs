function Base(value) { this.value = value; }
Base.category = "base";
function make(tag) {
  class Derived extends Base {
    tag = tag;
    describe() { return this.tag + ":" + this.value; }
  }
  return Derived;
}
const Left = make("left");
const Right = make("right");
console.log(new Left(10).describe(), new Right(20).describe());
console.log(Left.category, Right.category, Left === Right);
