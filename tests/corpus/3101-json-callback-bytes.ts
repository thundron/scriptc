export {};

const trace: string[] = [];
function observe(key: string, value: unknown): unknown {
  trace.push(key + ":" + typeof value);
  return value;
}
console.log(JSON.stringify({ bytes: new Uint8Array([3, 4]) }, observe));
console.log(trace.join("|"));
console.log(JSON.stringify({ replace: 0 }, (key: string, value: unknown): unknown => {
  return key === "replace" ? new Uint8Array([5, 6]) : value;
}));
console.log(JSON.stringify(0, (key: string, value: unknown): unknown => key === "" ? new Uint8Array([7, 8]) : value));
console.log(JSON.stringify(new Uint8Array([]), observe, 2));
