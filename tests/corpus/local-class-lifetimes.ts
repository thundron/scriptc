function factory(initial: number, label: string) {
  let shared = initial;
  const Local = class Counter {
    own: number;
    constructor(offset: number = shared) {
      this.own = offset;
      if (offset < 0) throw new Error(label);
    }
    get value(): number { return shared + this.own; }
    set value(next: number) { shared = next - this.own; }
    callback = (): string => `${label}:${shared}:${this.own}`;
    next(): number { return ++shared; }
  };
  shared++;
  return Local;
}
const A = factory(2, "first");
const B = factory(8, "second");
const a = new A();
const b = new A(10);
const c = new B();
console.log(a.value, b.value, c.value);
a.value = 20;
console.log(a.next(), b.value, c.value, a.callback());
try { new A(-1); } catch (error) { console.log((error as Error).message); }
console.log(b.callback());

function empty() { return class {}; }
const Empty = empty();
const Other = empty();
const e = new Empty();
console.log(Empty === Other, e instanceof Empty, e instanceof Other);

function late() {
  const Local = class { read(): number { return value; } };
  let value = 13;
  return Local;
}
const Late = late();
console.log(new Late().read());

function cycle(value: number): number {
  let read = (): number => value;
  const Local = class {
    read(): number { return read(); }
    direct(): number { return value; }
  };
  const instance = new Local();
  read = (): number => instance.direct();
  return instance.read();
}
for (let i = 0; i < 300; i++) cycle(i);
console.log(cycle(42));
