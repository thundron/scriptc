class Cell {
  value: number;
  constructor(value: number) { this.value = value; }
}

function read(cell: Cell): number { return cell.value; }
function relay(cell: Cell): number { return read(cell); }
function pair(left: Cell, right: Cell): number { return read(left) + relay(right); }
function recursive(cell: Cell, count: number): number {
  return count === 0 ? read(cell) : recursive(cell, count - 1);
}
function even(cell: Cell, count: number): number {
  return count === 0 ? read(cell) : odd(cell, count - 1);
}
function odd(cell: Cell, count: number): number {
  return count === 0 ? read(cell) + 1 : even(cell, count - 1);
}

function fromArray(cells: Cell[], index: number): number {
  const first = cells[index];
  const second = cells[index + 1];
  return pair(first, second) + recursive(first, 4) + even(second, 5);
}
const shared = new Cell(11);
const cells = [shared, shared, new Cell(17)];
console.log(fromArray(cells, 0), fromArray(cells, 1), shared.value);
console.log(read(new Cell(19)), pair(new Cell(23), new Cell(29)));
cells[-1] = new Cell(31);
cells[0.5] = new Cell(37);
cells[1.5] = new Cell(41);
cells[4_000_000_000] = new Cell(43);
cells[4_000_000_001] = new Cell(47);
console.log(fromArray(cells, -1), fromArray(cells, 0.5), fromArray(cells, 4_000_000_000));

function missing(cells: Cell[], index: number): void {
  try { console.log(fromArray(cells, index)); }
  catch (error) { if (error instanceof Error) console.log(error.name, error.message); }
}
missing(cells, 6);
cells.length = 1;
cells.length = 3;
missing(cells, 0);

function keepPayload(cells: Cell[]): Cell {
  const cell = cells[0];
  cells.length = 0;
  return cell;
}
const retained = keepPayload([new Cell(53)]);
console.log(read(retained), recursive(retained, 12));

function optional(cell: Cell | undefined): number {
  return cell === undefined ? -1 : read(cell);
}
function forwardOptional(cell: Cell | undefined): number { return optional(cell); }
console.log(forwardOptional(new Cell(59)), forwardOptional(undefined));

function selected(cells: Cell[]): Cell {
  const item = cells[0];
  console.log(optional(item));
  return item;
}
const selectedCell = selected([new Cell(61)]);
selectedCell.value = 67;
console.log(read(selectedCell));

type Entry = { value: number; name: string };
function recordValue(entry: Entry): number { return entry.value + entry.name.length; }
function recordRelay(entry: Entry): number { return recordValue(entry); }
function recordArray(entries: Entry[]): number {
  const entry = entries[0];
  return recordRelay(entry);
}
console.log(recordArray([{ value: 71, name: "record" }]), recordRelay({ value: 73, name: "fresh" }));
