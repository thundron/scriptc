// Computed tuple receivers evaluate once, including nested destructuring.
let calls = 0;
function source(): [number, number, number] {
  calls++;
  return values;
}
const values: [number, number, number] = [1, 2, 3];
let index = 0;
for (const value of source()) {
  console.log("live", value);
  if (index === 0) values[1] = 20;
  if (index === 1) values[2] = 30;
  index++;
}
console.log("calls", calls);
for (const [label, value] of [["left", 4], ["right", 5]] as const) console.log(label, value);

// Replacing the original binding does not replace the iterator's source.
let current: [number, number] = [6, 7];
for (const value of current) {
  current = [8, 9];
  console.log("original", value);
}

// Reference replacements and mixed union positions remain live too.
class Cell {
  value: number;
  constructor(value: number) { this.value = value; }
}
const cells: [Cell, Cell] = [new Cell(10), new Cell(11)];
for (const cell of cells) {
  console.log("cell", cell.value);
  if (cell.value === 10) cells[1] = new Cell(12);
}
const mixed: [number | string, boolean, number | string] = [1, true, "old"];
let position = 0;
for (const value of mixed) {
  if (position === 0) mixed[2] = "new";
  console.log("mixed", typeof value, value);
  position++;
}

// Per-iteration bindings, assignment heads, labels and cleanup share the
// ordinary for-of control flow.
const callbacks: (() => number)[] = [];
for (const value of [13, 14] as const) callbacks.push(() => value);
for (const callback of callbacks) console.log("capture", callback());
let assigned = 0;
for (assigned of [15, 16] as const) console.log("assigned", assigned);
console.log("after", assigned);
let label: string = "";
let number = 0;
for ([label, number] of [["a", 17], ["b", 18]] as const) console.log("destructure", label, number);
outer: for (const value of [1, 2, 3] as const) {
  try {
    if (value === 1) continue outer;
    for (const inner of [4, 5] as const) {
      console.log("nested", value, inner);
      break outer;
    }
  } finally { console.log("finally", value); }
}
try {
  for (const value of source()) {
    console.log("throw", value);
    throw new Error("stop");
  }
} catch (error) { if (error instanceof Error) console.log(error.message); }
console.log("calls", calls);

// Optional array reads holding tuples validate their payload at iteration.
const rows: [number, number][] = [[19, 20]];
for (const row of rows) for (const value of row) console.log("row", value);
try { for (const value of rows[1]) console.log(value); }
catch (error) { if (error instanceof Error) console.log("missing", error.name); }
