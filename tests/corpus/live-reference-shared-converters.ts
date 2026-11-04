class Cell {
  name: string;
  value: number;
  next: Cell | undefined = undefined;
  children: Cell[] = [];
  constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }
}

class Envelope {
  label: string;
  child: Cell;
  constructor(label: string, child: Cell) {
    this.label = label;
    this.child = child;
  }
}

function first(value: Cell | Envelope | undefined): unknown { return value; }
function second(value: Cell | string | null): unknown { return value; }
function third(value: Envelope | number | boolean): unknown { return value; }
function render(value: unknown): string { return JSON.stringify(value); }

const leaf = new Cell("leaf", 1);
const parent = new Cell("parent", 2);
parent.next = leaf;
parent.children.push(leaf);
const envelope = new Envelope("shared", parent);
const one = first(parent);
const two = second(parent);
const three = third(envelope);
console.log(one === two, (one as Cell) === parent, (three as Envelope).child === parent);
console.log(JSON.stringify(one), JSON.stringify(two), JSON.stringify(three));

leaf.value = 9;
console.log(JSON.stringify(one), JSON.stringify(three));
const view = one as { value: unknown; next: unknown; children: unknown };
view.value = 7;
console.log(parent.value, (two as Cell).value);
const childView = view.next as { value: unknown };
childView.value = 11;
console.log(leaf.value, parent.children[0] === leaf);

// The same type occurs as a union arm, a nested field, and a stream element.
async function streams(): Promise<void> {
  const records: { name: string; cell: Cell }[] = [
    { name: "first", cell: parent }, { name: "second", cell: leaf },
  ];
  const direct: unknown = records[0]!;
  console.log(render(direct));
  for await (const item of ReadableStream.from(records)) {
    console.log(item.name, item.cell === parent || item.cell === leaf, render(item));
    item.cell.value++;
  }
  console.log(parent.value, leaf.value, render(direct));
  console.log(first(undefined) === undefined, second(null) === null, second("text"), third(4), third(false));

  parent.next = parent;
  try { JSON.stringify(one); }
  catch (error) { console.log("cycle", error instanceof TypeError); }
  parent.next = leaf;
  console.log(JSON.stringify(two));
}

void streams();
