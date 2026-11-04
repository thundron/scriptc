export {};

const trace: string[] = [];
const source: unknown = JSON.parse('{"10":10,"2":2,"nested":{"keep":1,"omit":2},"items":[3,4],"empty":{}}');
const json = JSON.stringify(source, (key: string, value: unknown): unknown => {
  trace.push(key + ":" + typeof value);
  if (key === "omit") return undefined;
  if (typeof value === "number") return value * 10;
  return value;
}, 2);
console.log(json);
console.log(trace.join("|"));
console.log(JSON.stringify(source));

// The callback runs on the replacement's children, not on the replaced
// primitive a second time. A freshly returned record is traversed too.
console.log(JSON.stringify({ value: 7 }, (key: string, value: unknown): unknown => {
  if (key === "value") return { wrapped: value, missing: undefined };
  return value;
}));

// Omission rules differ for an object field, an array element and root.
function omit(key: string, value: unknown): unknown {
  return key === "1" || key === "drop" ? undefined : value;
}
console.log(JSON.stringify({ keep: null, drop: 1, list: [1, 2, 3] }, omit));
const absent = JSON.stringify({ present: true }, () => undefined);
console.log(absent === undefined, typeof absent);
const text = JSON.stringify(12, (_key: string, value: unknown) => value);
console.log(text === undefined ? "absent" : text.toUpperCase());
