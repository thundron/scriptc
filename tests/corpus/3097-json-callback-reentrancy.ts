export {};

let calls = 0;
const factor = 3;
function multiply(_key: string, value: unknown): unknown {
  calls++;
  return typeof value === "number" ? value * factor : value;
}
const outer = JSON.stringify({ first: 1, second: 2 }, (key: string, value: unknown): unknown => {
  if (key === "first") {
    const inner = JSON.stringify({ n: 4 }, multiply);
    if (inner === undefined) throw new Error("inner omitted");
    return JSON.parse(inner, multiply);
  }
  return value;
});
console.log(outer, calls);

// A callback exception must not leave a receiver or traversal frame active.
for (let attempt = 0; attempt < 20; attempt++) {
  const seen: string[] = [];
  try {
    JSON.stringify({ before: 1, fail: [2], after: 3 }, (key: string, value: unknown): unknown => {
      seen.push(key);
      if (key === "0") throw new TypeError("replacer failed");
      return value;
    });
  } catch (error) {
    if (attempt === 0) console.log(error instanceof TypeError, seen.join("|"));
  }
  try {
    JSON.parse('{"before":1,"fail":[2],"after":3}', (key: string, value: unknown): unknown => {
      if (key === "0") throw new RangeError("reviver failed");
      return value;
    });
  } catch (error) {
    if (attempt === 0) console.log(error instanceof RangeError);
  }
  const ok = JSON.parse('{"n":2}', multiply) as { n: number };
  if (ok.n !== 6) throw new Error("corrupted callback state");
}
console.log("recovered", calls);

// toJSON runs before the replacer for a property. Its exception must skip
// that property's callback and release both the receiver and callable.
for (let attempt = 0; attempt < 10; attempt++) {
  const seen: string[] = [];
  const input = {
    child: { toJSON: () => { throw new TypeError("toJSON failed"); } },
  };
  try {
    JSON.stringify(input, (key: string, value: unknown): unknown => {
      seen.push(key === "" ? "root" : key);
      return value;
    });
  } catch (error) {
    if (attempt === 0) console.log(error instanceof TypeError, seen.join("|"));
  }
}
console.log(JSON.stringify({ n: 4 }, multiply));
