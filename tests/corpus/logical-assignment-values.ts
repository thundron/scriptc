export {};

let effects = "";
function rhs(value: number): number { effects += "R"; return value; }
let number = 0;
console.log(number &&= rhs(1), number, effects);
console.log(number ||= rhs(2), number, effects);
console.log(number ||= rhs(3), number, effects);
console.log(number &&= rhs(4), number, effects);
number = NaN;
console.log(number ||= rhs(5), number, effects);
number = -0;
console.log(number &&= rhs(6), Object.is(number, -0), effects);

let text = "";
console.log(text ||= "filled", text);
console.log(text &&= "changed", text);
let flag = false;
console.log(flag &&= true, flag);
console.log(flag ||= true, flag);
console.log(flag &&= false, flag);

function optional(value: string | undefined): string | undefined {
  value &&= "changed";
  console.log("and", value);
  value ||= "default";
  return value;
}
console.log(optional(undefined), optional(""), optional("present"));

// Evaluation of the reference precedes its single read. The setter runs
// only when the selected branch actually assigns, and the result is the
// RHS value even when the setter stores a different value.
class Cell {
  stored = 0;
  get value(): number { effects += "G"; return this.stored; }
  set value(value: number) { effects += "S"; this.stored = value + 10; }
}
const cell = new Cell();
function receiver(): Cell { effects += "O"; return cell; }
effects = "";
console.log(receiver().value &&= rhs(1), cell.stored, effects);
effects = "";
console.log(receiver().value ||= rhs(2), cell.stored, effects);
effects = "";
console.log(receiver().value ||= rhs(3), cell.stored, effects);
effects = "";
console.log(receiver().value &&= rhs(4), cell.stored, effects);

const values = [0, 2];
function array(): number[] { effects += "A"; return values; }
function key(value: number): number { effects += "K"; return value; }
effects = "";
console.log(array()[key(0)] ||= rhs(7), values[0], effects);
effects = "";
console.log(array()[key(1)] &&= rhs(8), values[1], effects);
effects = "";
console.log(array()[key(9)] &&= rhs(9), values.length, effects);
effects = "";
console.log(array()[key(9)] ||= rhs(10), values.length, effects);

// The receiver remains the one evaluated before the RHS changes its alias.
let active = [0];
const original = active;
function replace(): number { active = [20]; return 30; }
console.log(active[0] ||= replace(), original[0], active[0]);

function captured(): void {
  let value = "";
  const fill = (): string => value ||= "capture";
  console.log(fill(), fill(), value);
}
captured();

function fail(): number { effects += "T"; throw new Error("rhs"); }
let preserved = 0;
effects = "";
try { preserved ||= fail(); }
catch (error) { if (error instanceof Error) console.log(error.message); }
console.log(preserved, effects);
preserved = 2;
effects = "";
console.log(preserved ||= fail(), effects);

// A forward captured binding still checks TDZ before deciding whether to
// evaluate the RHS. Neither logical operator can initialize its empty box.
function forward(): void {
  const write = (): void => { value ||= rhs(40); };
  effects = "";
  try { write(); }
  catch (error) { if (error instanceof Error) console.log(error.name, effects); }
  let value = 0;
  write();
  console.log(value, effects);
}
forward();
