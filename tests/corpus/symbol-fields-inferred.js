const key = Symbol.for("scriptc.inferred.symbol");
const variance = { identity: value => value, version: "one" };

class Holder {
  [key];
  constructor(value) {
    console.log(this[key]);
    this[key] = value;
  }
  read() { return this[key]; }
}
class Derived extends Holder {
  [key];
}
class Initialized {
  [key] = variance;
  read(value) { return this[key].identity(value); }
}

const holder = new Holder("value");
console.log(holder.read());
console.log(new Derived("base").read());
console.log(new Initialized().read("inferred"));
