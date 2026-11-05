function makeCounter(start: number) {
  let value = start;
  const Local = class Counter {
    read(): number { return value; }
    increment(): number { return ++value; }
    callback = (): number => value;
  };
  value++;
  return Local;
}
const First = makeCounter(10);
const Second = makeCounter(20);
const a = new First();
const b = new First();
const c = new Second();
console.log(First.name, First === First, First === Second);
console.log(a.read(), b.increment(), a.callback(), c.read());
console.log(a instanceof First, a instanceof Second, c instanceof First, c instanceof Second);
