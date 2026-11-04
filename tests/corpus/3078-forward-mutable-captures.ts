export {};

function counters(): void {
  const read = () => depth;
  const step = () => depth++;
  const next = () => ++depth;
  const previous = () => --depth;
  const assign = (value: number) => depth = value;
  const add = (value: number) => { depth += value; };
  let depth = 2;
  console.log("counter", read(), step(), next(), previous(), read());
  console.log("assign", assign(10), read());
  add(3);
  depth--;
  console.log("shared", read(), depth);
}
counters();

function references(): void {
  const read = () => state;
  const set = (name: string) => state = { name, values: [name.length] };
  const edit = () => { state.values.push(9); };
  let state = { name: "initial", values: [1] };
  const old = read();
  const changed = set("replacement");
  edit();
  console.log("references", old.name, old.values.join(","), changed.name, read() === changed, changed.values.join(","));
}
references();

function flags(): void {
  const get = () => flag;
  const set = (value: boolean) => flag = value;
  let flag = false;
  console.log("flag", get(), set(true), get());
  flag = false;
  console.log("flag", get());
}
flags();

// The declaring frame can return while sibling closures keep sharing
// the same mutable cell. Intermediate closures must forward its flags.
function factory(): { read: () => number; update: (value: number) => number } {
  const make = () => ({ read: () => value, update: (next: number) => value = next });
  const pair = make();
  let value = 1;
  return pair;
}
const pair = factory();
console.log("escaped", pair.read(), pair.update(8), pair.read());

function walk(): number {
  function enter(count: number): void {
    depth++;
    maximum = Math.max(maximum, depth);
    if (count > 0) enter(count - 1);
    depth--;
  }
  let depth = 0;
  let maximum = 0;
  enter(5);
  console.log("walk", depth, maximum);
  return maximum;
}
console.log(walk());

function replaceText(): void {
  const append = () => text = text + "!";
  const get = () => text;
  let text = "hello";
  console.log(append(), get());
  text = "again";
  console.log(append(), get());
}
replaceText();

let sum = 0;
for (let i = 0; i < 100; i++) {
  const instance = factory();
  sum += instance.update(i) + instance.read();
}
console.log("stress", sum);

// The forward capture is first discovered inside this very initializer.
let stored: () => number = () => 0;
function remember(read: () => number): number { stored = read; return 4; }
function recursiveInitializer(): void {
  let value = remember(() => value);
  console.log("self init", stored());
  value = 10;
  console.log("self replacement", stored());
}
recursiveInitializer();
console.log("self escaped", stored());

// Re-entering a block creates a fresh binding, while each iteration's
// reader/writer pair keeps sharing its own cell after the loop ends.
function iterations(): void {
  const readers: (() => number)[] = [];
  const writers: ((next: number) => void)[] = [];
  for (let i = 0; i < 3; i++) {
    const read = () => value;
    const write = (next: number): void => { value = next; };
    let value = i;
    readers.push(read);
    writers.push(write);
  }
  writers[0]!(10);
  writers[2]!(20);
  console.log("iterations", readers[0]!(), readers[1]!(), readers[2]!());
}
iterations();

function shadowed(): void {
  const read = () => value;
  let value = 1;
  {
    const change = (): void => { value = 4; };
    let value = 2;
    change();
    console.log("inner", value);
  }
  value = 3;
  console.log("outer", read());
}
shadowed();
