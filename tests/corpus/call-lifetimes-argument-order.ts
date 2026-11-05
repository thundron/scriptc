class Entry {
  value: number;
  constructor(value: number) { this.value = value; }
}
let events = "";
function read(entry: Entry, ignored: number): number { events += "r"; return entry.value + ignored; }
function clear(entries: Entry[]): number { events += "c"; entries.length = 0; return 2; }
function replace(entries: Entry[]): number { events += "p"; entries[0] = new Entry(99); return 3; }
function throwLater(): number { events += "t"; throw new Error("later argument"); }
function fresh(value: number): Entry { events += "f"; return new Entry(value); }

function fromArray(entries: Entry[]): number {
  const entry = entries[0];
  return read(entry, clear(entries));
}
console.log(fromArray([new Entry(7)]), events);
events = "";
function replaceOwner(entries: Entry[]): number {
  const entry = entries[0];
  return read(entry, replace(entries)) + entries[0].value;
}
console.log(replaceOwner([new Entry(11)]), events);

events = "";
function localSnapshot(): number {
  let entry = new Entry(13);
  return read(entry, (entry = new Entry(17)).value) + entry.value;
}
console.log(localSnapshot(), events);

let globalEntry = new Entry(19);
function updateGlobal(): number { events += "g"; globalEntry = new Entry(23); return globalEntry.value; }
events = "";
console.log(read(globalEntry, updateGlobal()), globalEntry.value, events);

function capturedSnapshot(): number {
  let entry = new Entry(29);
  function update(): number { events += "u"; entry = new Entry(31); return entry.value; }
  return read(entry, update()) + entry.value;
}
events = "";
console.log(capturedSnapshot(), events);

function projected(entries: Entry[]): Entry { events += "v"; return entries[0]; }
events = "";
const container = [new Entry(37)];
console.log(read(projected(container), clear(container)), container.length, events);

for (let i = 0; i < 3; i++) {
  events = "";
  try { console.log(read(fresh(i + 41), throwLater())); }
  catch (error) { if (error instanceof Error) console.log(error.message, events); }
}

function failInside(entry: Entry, count: number): number {
  events += "i";
  if (count === 0) throw new Error("callee");
  return read(entry, count);
}
events = "";
try { console.log(failInside(fresh(47), 0)); }
catch (error) { if (error instanceof Error) console.log(error.message, events); }

function pair(left: Entry, right: Entry, count: number): number {
  events += "b";
  return left.value + right.value + count;
}
events = "";
console.log(pair(fresh(53), fresh(59), 1), events);
events = "";
try { console.log(pair(fresh(61), fresh(67), throwLater())); }
catch (error) { if (error instanceof Error) console.log(error.message, events); }
