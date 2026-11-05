import * as Keys from "./keys.ts";

class Base {
  value = 7;
  [Keys.read](extra: number) { return this.value + extra; }
}
class Derived extends Base {
  [Keys.read](extra: number) { return this.value * extra; }
}
function invoke(value: Base) { return value[Keys.read](3); }
console.log(invoke(new Base()), invoke(new Derived()));
const key: typeof Keys.read = Keys.read;
console.log(new Derived()[key](4));
