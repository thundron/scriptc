function base(label: string) {
  class Base {
    value = 2;
    read(): string { return label + this.value; }
  }
  return Base;
}
function extend(Base: ReturnType<typeof base>, increment: number) {
  class Derived extends Base {
    constructor() { super(); this.value += increment; }
    read(): string { return super.read() + "!"; }
  }
  return Derived;
}
const A = base("a");
const B = base("b");
const C = extend(A, 3);
const D = extend(B, 7);
const c = new C();
const d = new D();
console.log(c.read(), d.read());
console.log(c instanceof A, c instanceof B, c instanceof C, c instanceof D);
console.log(d instanceof A, d instanceof B, d instanceof C, d instanceof D);
