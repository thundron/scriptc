const marker = Symbol.for("test/class-presence");
class Base {
  inherited = 1;
  method(): number { return 2; }
}
class Item extends Base {
  slot = 3;
  [marker] = 4;
  get getter(): number { throw new Error("presence must not read a getter"); }
}
const item = new Item();
function has(key: string): boolean { return key in item; }
for (const key of ["slot", "inherited", "method", "getter", "missing"]) console.log(has(key));
function hasSymbol(key: symbol): boolean { return key in item; }
console.log(hasSymbol(marker), hasSymbol(Symbol("missing")));
function invoke(value: any, key: string): any { return value[key](); }
console.log(invoke(item, "method"));
function invokeTyped(key: "method"): number { return item[key](); }
function invokeComputed(key: string): number {
  // @ts-expect-error This checks a runtime method name on a native receiver.
  return item[key]();
}
console.log(invokeTyped("method"), invokeComputed("method"));
let order = "";
function key(): string { order += "key "; return "slot"; }
function receiver(): Item { order += "receiver"; return item; }
console.log(key() in receiver(), order);
