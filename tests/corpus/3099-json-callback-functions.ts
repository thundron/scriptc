export {};

function replacement(): number { return 7; }
function filter(key: string, value: unknown): unknown {
  if (key === "a" || key === "0") return replacement;
  return value;
}
console.log(JSON.stringify({ a: 1, b: [2, 3] }, filter));
console.log(JSON.stringify(4, () => replacement) === undefined);
console.log(JSON.stringify(undefined, () => "defined"));
console.log(JSON.stringify(replacement, () => 8));

// Named functions and closures use the same native callback ABI. Fewer
// declared parameters are allowed; ignored arguments still exist at call.
function rootName(key: string): string { return key === "" ? "root" : "child"; }
console.log(JSON.stringify({ a: 2 }, rootName));
console.log(JSON.parse("0", () => 9));
const prefix = "key:";
console.log(JSON.parse("false", (key: string) => prefix + key));

const withMethod = { x: 1, toJSON: (key: string) => ({ key, converted: 2 }) };
console.log(JSON.stringify({ nested: withMethod }, (_key: string, value: unknown) => value));
console.log(JSON.stringify(withMethod, (_key: string, value: unknown) => value));

// Argument evaluation completes before conversion into the callback tree.
const mutable = { n: 1 };
function makeCallback(): (key: string, value: unknown) => unknown {
  mutable.n = 9;
  return (_key: string, value: unknown) => value;
}
console.log(JSON.stringify(mutable, makeCallback()));

function shadowed(undefined: (key: string, value: unknown) => unknown): void {
  console.log(JSON.stringify(1, undefined));
  console.log(JSON.parse("1", undefined));
}
shadowed(() => 8);

// The result of toJSON is passed straight to the replacer. Its own
// toJSON property is an ordinary function-valued field, not another hook.
const once = { toJSON: () => ({ value: 3, toJSON: () => { throw new Error("must not recur"); } }) };
console.log(JSON.stringify(once, (_key: string, value: unknown) => value));
