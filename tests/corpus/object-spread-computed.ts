let calls = 0;
const source = { x: 1, y: 2 };
function readSource() {
  calls++;
  return source;
}
function mutateSource() {
  source.x = 9;
  source.y = 10;
  return { z: 3 };
}
const copied = { ...readSource(), ...mutateSource() };
console.log(calls, copied.x, copied.y, copied.z, source.x);

let order = "";
function value(label: string, n: number) {
  order += label;
  return n;
}
function pair() {
  order += "B";
  return { x: 20, y: 30 };
}
// @ts-expect-error The overwrite is intentional; its earlier initializer must still run.
const overwritten = { x: value("A", 1), ...pair(), y: value("C", 40) };
console.log(order, overwritten.x, overwritten.y);

function empty() {
  order += "D";
  return {};
}
const discarded = { ...pair(), ...empty(), x: value("E", 50), y: value("F", 60) };
console.log(order, discarded.x, discarded.y);

function optional(present: boolean): { x: number; y: number } | undefined {
  calls++;
  return present ? { x: 7, y: 8 } : undefined;
}
const absent = { ...source, ...optional(false) };
const present = { ...source, ...optional(true) };
console.log(calls, absent.x, absent.y, present.x, present.y);

function fail(): { x: number; y: number } {
  order += "G";
  throw new Error("spread failed");
}
try {
  const failed = { before: value("H", 0), ...fail(), after: value("I", 0) };
  console.log(failed.x);
} catch (error) {
  if (error instanceof Error) console.log(error.message, order);
}

const dropped: PromiseRejectedResult = {
  ...{ status: "rejected" as const },
  reason: console.log("reason evaluated"),
  status: "rejected",
};
console.log(dropped.status);
