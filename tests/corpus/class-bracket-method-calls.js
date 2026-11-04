class Base {
  value() { return 'base'; }
}
class Derived extends Base {
  value() { return 'derived'; }
}
const base = new Base();
const derived = new Derived();
console.log(base['value'](), derived['value']());
let asBase = derived;
console.log(asBase['value']());
class Keyword {
  w\u0069th() { return 42; }
}
console.log(new Keyword()['with']());
class Numeric {
  [7]() { return 'seven'; }
}
console.log(new Numeric()[7]());
