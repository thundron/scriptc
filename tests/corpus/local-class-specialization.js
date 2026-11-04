function make(value) {
  return class Stored {
    read() { return value; }
    matches(other) { return other === value; }
  };
}
const Numbers = make(12);
const OtherNumbers = make(25);
const Strings = make("hello");
const a = new Numbers();
const b = new OtherNumbers();
const c = new Strings();
console.log(Numbers.name, Numbers === OtherNumbers);
console.log(a.read(), b.read(), c.read());
console.log(a.matches(12), b.matches(12), c.matches("hello"));
console.log(a instanceof Numbers, a instanceof OtherNumbers, c instanceof Strings);
