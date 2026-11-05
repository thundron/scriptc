function make(label: string) {
  class LocalError extends Error {
    code = 12;
    read(): string { return label + ":" + this.message + ":" + this.code; }
    own(): typeof LocalError { return LocalError; }
  }
  const item = new LocalError("first");
  console.log(item.read(), item instanceof Error, item.own() === LocalError);
  label += "!";
  return LocalError;
}
const A = make("a");
const B = make("b");
const a = new A("later");
console.log(a.read(), a instanceof A, a instanceof B, A === B);
console.log(a instanceof Error, a.name, a.message);

class Parent { value = 3; read(): number { return this.value; } }
function makeChild(add: number) {
  class Child extends Parent {
    extra = add;
    read(): number { return super.read() + this.extra; }
  }
  return Child;
}
const Child = makeChild(8);
const child = new Child();
console.log(child.read(), child instanceof Parent, child instanceof Child);
