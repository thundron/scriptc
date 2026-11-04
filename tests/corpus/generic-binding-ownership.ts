export {};

// Each specialization revisits the same declaration symbols. Its locals,
// hoisted functions, and forward captures must belong to that invocation.
function stored<T>(value: T): T {
  var saved = value;
  if (true) {
    var saved = value;
  }
  return saved;
}
console.log(stored(1), stored("text"), stored(true));
console.log(stored({ name: "record" }).name, stored([2, 3]).join(","));

function declaredLater<T>(value: T): T {
  return read();
  function read(): T { return value; }
}
console.log(declaredLater(4), declaredLater("later"), declaredLater(false));
console.log(declaredLater({ name: "captured" }).name);

// A reference inside one lifted function hoists the sibling in its owner,
// then threads the resulting capture back through the original function.
function siblings<T>(value: T): T {
  return first();
  function first(): T { return second(); }
  function second(): T { return value; }
}
console.log(siblings(5), siblings("siblings"));

function forwardVar<T>(value: T): T | undefined {
  const outer = (): (() => T | undefined) => () => pending;
  const read = outer();
  console.log("before var", read() === undefined);
  var pending: T | undefined = value;
  return read();
}
console.log(forwardVar(6), forwardVar("var"));

function forwardConst<T>(value: T): T {
  const outer = (): (() => T) => () => pending;
  const read = outer();
  try { read(); }
  catch (error) {
    if (error instanceof Error) console.log("before const", error.name);
  }
  const pending = value;
  return read();
}
console.log(forwardConst(7), forwardConst("const"), forwardConst(true));

function forwardLet<T>(first: T, second: T): T {
  const read = (): T => pending;
  const write = (next: T): void => { pending = next; };
  try { write(first); }
  catch (error) {
    if (error instanceof Error) console.log("before let", error.name);
  }
  let pending = first;
  write(second);
  return read();
}
console.log(forwardLet(8, 9), forwardLet("first", "second"));

// A nested block still owns its TDZ slot even though the capture originates
// in a deeper function. A same-name outer binding remains independent.
function shadowed<T>(value: T): T {
  const pending = "outer";
  {
    const read = (): T => pending;
    const pending = value;
    console.log("inner", read() === value);
  }
  console.log(pending);
  return value;
}
console.log(shadowed(10), shadowed("block"));

// Returned closures continue reading their own boxes after later calls,
// including another specialization, have created and updated other boxes.
function counter<T>(initial: T): { read: () => T; write: (value: T) => void } {
  const read = (): T => current;
  const write = (value: T): void => { current = value; };
  let current = initial;
  return { read, write };
}
const numberCounter = counter(11);
const textCounter = counter("eleven");
const otherNumberCounter = counter(12);
numberCounter.write(13);
textCounter.write("thirteen");
console.log(numberCounter.read(), textCounter.read(), otherNumberCounter.read());

class Storage<T> {
  value: T;
  constructor(value: T) { this.value = value; }
  read(): T {
    var stored = this.value;
    return later();
    function later(): T { return stored; }
  }
  paired<U>(other: U): { value: T; other: U } {
    var saved = other;
    const read = (): T => value;
    const value = this.value;
    return { value: read(), other: saved };
  }
}
const numbers = new Storage(14);
const strings = new Storage("fourteen");
console.log(numbers.read(), strings.read());
console.log(numbers.paired("fifteen").other, strings.paired(15).other);
console.log(numbers.paired(false).value, strings.paired(true).value);
