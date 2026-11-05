export {};

type Context = { context: string };
type Descriptor = Context | { callback: string } | string | number | undefined;
function isContext(value: Descriptor): value is Context {
  return typeof value === "object" && value !== null && "context" in value;
}
const values: (string | Context)[] = ["one", { context: "two" }, "three"];
console.log("some", values.some(isContext));
console.log("every", values.every(isContext));
console.log("first", values.findIndex(isContext), "last", values.findLastIndex(isContext));

function describe(value: Descriptor): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value === undefined) return "undefined";
  return "context" in value ? value.context : value.callback;
}
console.log("map", values.map(describe).join("/"));
let visited = "";
function visit(value: Descriptor): void { visited += describe(value) + ";"; }
values.forEach(visit);
console.log("each", visited);
function keep(value: Descriptor): boolean { return typeof value !== "string"; }
console.log("filter", values.filter(keep).map(describe).join("/"));

// The receiver itself is passed through the adapter without copying.
const numbers: number[] = [3, 5, 7];
function mutate(value: string | number | undefined, index: number, array: number[] | string[]): boolean {
  console.log("callback", value, index, array === numbers);
  if (index === 0) numbers[1] = 11;
  return typeof value === "number" && value > 9;
}
console.log("mutation", numbers.some(mutate), numbers.join(","));

let calls = 0;
function choose(): (value: number | string | undefined) => boolean {
  calls++;
  return (value) => typeof value === "number" && value === 7;
}
console.log("evaluate once", numbers.some(choose()), calls);
try {
  numbers.forEach((value: number | string | undefined) => {
    if (value === 11) throw new Error("stop");
  });
} catch (error) {
  if (error instanceof Error) console.log("throw", error.message);
}
