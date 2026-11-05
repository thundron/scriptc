export {};

const trace: string[] = [];
const result: unknown = JSON.parse('{"10":10,"2":2,"nested":{"keep":1,"omit":2},"items":[3,4],"empty":{}}',
  (key: string, value: unknown): unknown => {
    trace.push(key + ":" + typeof value);
    if (key === "omit") return undefined;
    if (typeof value === "number") return value * 10;
    return value;
  });
console.log(JSON.stringify(result));
console.log(trace.join("|"));
console.log(JSON.stringify(JSON.parse('{"a":1,"a":2,"__proto__":{"safe":true}}', (_key: string, value: unknown) => value)));

// Root replacement is observable even for scalar input.
console.log(JSON.stringify(JSON.parse("17", () => ({ answer: 42 }))));
console.log(JSON.parse("17", () => undefined) === undefined);
console.log(JSON.parse("false", () => "root"));
console.log(JSON.stringify(JSON.parse('{"a":{"b":1}}', (key: string, value: unknown): unknown => {
  if (key === "a") return [8, 9];
  return value;
})));

let calls = 0;
try {
  JSON.parse('{"x":}', () => { calls++; return 1; });
} catch (error) {
  console.log(error instanceof SyntaxError, calls);
}
console.log(JSON.stringify(JSON.parse('{"x":3}', undefined)));
