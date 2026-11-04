class Base {
  value = 2;
  read(): number { return this.value; }
}
class Middle extends Base {}
class Derived extends Middle {
  extra = 3;
  read(): number { return this.value + this.extra; }
}
class Unrelated { value = 8; }
const derived = new Derived();
const boxed: unknown = derived;
const base = boxed as Base;
console.log('base', base === derived, base instanceof Derived, base.read());
base.value = 7;
console.log('shared', derived.value, base.read());
const array: unknown = [derived];
const bases = array as Base[];
console.log('array', bases[0] === derived, bases[0]!.read());
const candidate: unknown = derived;
const optional = candidate as Base | undefined;
console.log('union', optional === derived, optional!.read());
const unrelated: unknown = new Unrelated();
console.log('unrelated', unrelated instanceof Base);
