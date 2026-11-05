function make(value) {
  return class Base {
    static value = value;
    value() { return value; }
  };
}
function derive(value) {
  return class Child extends make(value) {
    static label = "child";
  };
}
const Text = derive("text");
const Count = derive(42);
console.log(Text.label, Text.value, new Text().value());
console.log(Count.label, Count.value, new Count().value());

class Middle extends make("ancestor") {}
class Descendant extends Middle {}
console.log(new Descendant().value());
