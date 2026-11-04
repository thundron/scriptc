export {};

const value = { a: [1, { b: true }], empty: {}, list: [], drop: 7 };
function identity(key: string, value: unknown): unknown {
  return key === "drop" ? undefined : value;
}
console.log(JSON.stringify(value, identity));
console.log(JSON.stringify(value, identity, 0));
console.log(JSON.stringify(value, identity, -3));
console.log(JSON.stringify(value, identity, 2.8));
console.log(JSON.stringify(value, identity, 20));
console.log(JSON.stringify(value, identity, "abcdefghijk"));
console.log(JSON.stringify(value, identity, "\t"));
console.log(JSON.stringify(value, identity, undefined));
console.log(JSON.stringify({ a: 1 }, () => undefined, 2) === undefined);
console.log(JSON.stringify({ a: 1 }, () => "escaped\n\t\"\\", 2));
console.log(JSON.stringify({ omit: 1 }, (key: string, value: unknown): unknown => key === "omit" ? undefined : value, 2));
