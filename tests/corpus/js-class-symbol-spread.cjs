const key = Symbol.for("x");
class Base { [key] = true; name = "base"; }
class C extends Base {}
const value = new C();
const plain = { ...value };
let name = "extra";
const computed = { [name]: 1, ...value };
console.log(plain.name, plain[key], Object.hasOwn(plain, key));
console.log(computed.extra, computed.name, computed[key], Object.hasOwn(computed, key));
console.log(Object.getOwnPropertySymbols(plain).length, Object.keys(plain).join(","));
plain[key] = false;
console.log(value[key], plain[key], computed[key]);
