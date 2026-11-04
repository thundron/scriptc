interface Cell { value: number; label: string; }

function numberText(value: number | undefined): string {
  return value === undefined ? "missing" : Object.is(value, -0) ? "negative zero" : String(value);
}
function boolText(value: boolean | undefined): string {
  return value === undefined ? "missing" : value ? "true" : "false";
}
function cellText(value: Cell | undefined): string {
  return value === undefined ? "missing" : value.label + ":" + value.value;
}
function join(left: Cell | undefined, right: Cell | undefined, suffix: string): string {
  return cellText(left) + "/" + cellText(right) + suffix;
}

const numbers = new Map<number, number>([[0, -0], [1, NaN], [2, Infinity]]);
const flags = new Map<string, boolean>([["on", true], ["off", false]]);
for (let i = 0; i < 4; i++) {
  const value = numbers.get(i);
  console.log("number", numberText(value), numberText(numbers.get(i)));
}
for (const key of ["on", "off", "absent"]) {
  const value = flags.get(key);
  console.log("flag", boolText(value), boolText(flags.get(key)));
}

const cells = new Map<string, Cell>();
cells.set("first", { value: 1, label: ["alpha", "one"].join("-") });
cells.set("second", { value: 2, label: ["beta", "two"].join("-") });
function replace(): Cell | undefined {
  const previous = cells.get("second");
  cells.clear();
  cells.set("first", { value: 3, label: "replacement" });
  return previous;
}
console.log("arguments", join(cells.get("first"), replace(), ":done"));
const snapshot = cells.get("first");
cells.delete("first");
console.log("snapshot", cellText(snapshot), cellText(cells.get("first")));

function extract(value: Cell | undefined): Cell {
  if (value === undefined) throw new Error("missing cell");
  return value;
}
cells.set("kept", { value: 4, label: "payload" });
const kept = extract(cells.get("kept"));
cells.clear();
kept.value = 5;
console.log("returned payload", kept.label, kept.value);

const key = { id: 1 };
const objects = new Map<{ id: number }, Cell>();
objects.set(key, { value: 6, label: "identity" });
console.log("object keys", objects.has(key), cellText(objects.get(key)), cellText(objects.get({ id: 1 })));
const names = new Set<string>(["alpha", "beta"]);
function contains(name: string): boolean { return names.has(name); }
console.log("membership", contains("alpha"), contains("other"), names.size, objects.size);

const mixed = new Map<string, Cell | undefined>();
mixed.set("present", kept);
mixed.set("undefined", undefined);
for (const name of ["present", "undefined", "absent"]) console.log("union", mixed.has(name), cellText(mixed.get(name)));

let current = new Map<number, Cell>([[1, { value: 7, label: "original" }]]);
function changeReceiver(): number {
  current = new Map<number, Cell>([[1, { value: 8, label: "new" }]]);
  return 1;
}
console.log("receiver", cellText(current.get(changeReceiver())), cellText(current.get(1)));

const texts = new Map<string, string>([["value", ["owned", "string"].join("-")]]);
const text = texts.get("value");
texts.clear();
console.log("string snapshot", text === undefined ? "missing" : text.toUpperCase());
