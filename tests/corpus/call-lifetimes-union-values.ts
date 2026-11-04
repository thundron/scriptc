function numberValue(value: number | undefined): number {
  return value === undefined ? 101 : value;
}
function numberRelay(value: number | undefined): number { return numberValue(value); }
function booleanValue(value: boolean | undefined): number {
  return value === undefined ? -1 : value ? 1 : 0;
}
function stringValue(value: string | undefined): string {
  return value === undefined ? "missing" : value;
}
function nullable(value: string | null): number {
  return value === null ? -1 : value.length;
}
console.log(numberRelay(7), numberRelay(undefined));
console.log(Object.is(numberRelay(-0), -0), Object.is(numberRelay(0), 0));
console.log(Number.isNaN(numberRelay(NaN)), numberRelay(Infinity), numberRelay(-Infinity));
console.log(booleanValue(true), booleanValue(false), booleanValue(undefined));
console.log(stringValue("hello"), stringValue(undefined), nullable(null), nullable("text"));

function strings(values: string[]): string {
  const first = values[0];
  values.length = 0;
  return stringValue(first);
}
console.log(strings(["owned string"]), strings([]));

class Box {
  text: string;
  constructor(text: string) { this.text = text; }
}
function textOf(box: Box | undefined): string {
  return box === undefined ? "empty" : box.text;
}
function project(box: Box | undefined): Box | undefined {
  return box;
}
function literalCalls(): void {
  console.log(textOf(new Box("fresh")), textOf(undefined));
  const first: Box | undefined = new Box("local");
  console.log(textOf(first));
  const second: Box | undefined = undefined;
  console.log(textOf(second));
}
literalCalls();
const returned = project(new Box("escaped"));
console.log(textOf(returned));

function stringLoop(): string {
  let result = "";
  for (let i = 0; i < 4; i++) {
    const text: string | undefined = "x";
    result += stringValue(text);
  }
  return result;
}
console.log(stringLoop());

function choice(value: number | string | undefined): string {
  if (value === undefined) return "none";
  if (typeof value === "string") return value;
  return value.toFixed(1);
}
function choiceRelay(value: number | string | undefined): string { return choice(value); }
console.log(choiceRelay(1.25), choiceRelay("branch"), choiceRelay(undefined));

function failAfter(value: string | undefined, fail: boolean): string {
  if (fail) throw new Error("after union");
  return stringValue(value);
}
try { console.log(failAfter("temporary", true)); }
catch (error) { if (error instanceof Error) console.log(error.message); }
console.log(failAfter("survived", false));
