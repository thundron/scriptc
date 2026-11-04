class Cell {
  x: number;
  y: number;
  constructor(x: number) { this.x = x; this.y = x + 1; }
}

function read(values: Cell[], index: number): number {
  const value = values[index];
  return value.x + value.y;
}
function missing(values: Cell[], index: number): void {
  try { console.log(read(values, index)); }
  catch (error) { if (error instanceof Error) console.log(error.name, error.message); }
}
const values = [new Cell(2)];
console.log(read(values, 0), read(values, -0));
values[0.5] = new Cell(7);
values[-1] = new Cell(9);
values[NaN] = new Cell(11);
values[Infinity] = new Cell(13);
values[4_000_000_000] = new Cell(15);
console.log(read(values, 0.5), read(values, -1), read(values, NaN), read(values, Infinity), read(values, 4_000_000_000));
missing(values, 1);
missing(values, 2);
missing(values, -2);
values.length = 0;
missing(values, 0);

function truncate(values: Cell[]): number {
  const value = values[0];
  values.length = 0;
  value.x += 3;
  return value.x;
}
function replace(values: Cell[]): Cell {
  const value = values[0];
  values[0] = new Cell(99);
  return value;
}
console.log(truncate([new Cell(17)]), replace([new Cell(19)]).x);

function nestedLength(values: number[][], index: number): number {
  const value = values[index];
  values.length = 0;
  return value === undefined ? -1 : value.length;
}
console.log(nestedLength([], 0), nestedLength([[1, 2]], 0));

let changing = [new Cell(23)];
function changeIndex(): number { changing = [new Cell(200)]; return 0; }
function ordered(): number {
  const value = changing[changeIndex()];
  return value.x;
}
console.log(ordered(), changing[0].x);

function delayedThrow(values: Cell[]): void {
  const value = values[1];
  console.log("before missing use");
  value.x += 1;
}
try { delayedThrow([new Cell(29)]); }
catch (error) { if (error instanceof Error) console.log(error.name, error.message); }

function escaped(values: Cell[]): () => number {
  const value = values[0];
  return () => value.x;
}
const escapeArray = [new Cell(31)];
const closure = escaped(escapeArray);
escapeArray.length = 0;
console.log(closure());

function pairs(values: Cell[]): number {
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    const a = values[i];
    for (let j = i + 1; j < values.length; j++) {
      const b = values[j];
      a.x += b.y;
      b.x += a.y;
      total += a.x + b.x;
    }
  }
  return total;
}
const shared = new Cell(3);
console.log(pairs([shared, shared, new Cell(5)]), shared.x);

function throwingLoops(values: Cell[]): number {
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    try {
      const value = values[i];
      if (i === 0) continue;
      total += value.x;
    } catch { total += 100; }
    finally { total += 1; }
  }
  return total;
}
const holes = [new Cell(37)];
holes[2] = new Cell(43);
console.log(throwingLoops(holes));

function growing(values: Cell[]): number {
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (i === 0) values.push(new Cell(47));
    total += value.x;
    if (i === 1) values.length = 1;
  }
  return total;
}
console.log(growing([new Cell(2)]));

// An effectful RHS must keep the compound receiver's original owner alive.
let receiver = new Cell(53);
const original = receiver;
function replaceReceiver(): number { receiver = new Cell(59); return 7; }
receiver.x += replaceReceiver();
console.log(original.x, receiver.x);

// Different static views of an inherited field must still alias.
class Derived extends Cell { extra: number = 1; }
function inherited(base: Cell, derived: Derived): number {
  const old = base.x;
  derived.x += 3;
  derived.y += 4;
  return old + base.x + base.y;
}
const derived = new Derived(61);
console.log(inherited(derived, derived));
