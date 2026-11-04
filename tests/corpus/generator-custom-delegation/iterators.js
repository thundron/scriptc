export function asIterable(value) { return value; }

export class Protocol {
  step = 0;
  next(value) {
    console.log("next", value);
    this.step++;
    return { value: this.step === 1 ? "yielded" : value, done: this.step > 1 };
  }
  return(value) {
    console.log("return", value);
    return { value: "closed:" + value, done: true };
  }
  throw(value) {
    console.log("throw", value);
    return { value: "recovered:" + value, done: true };
  }
  [Symbol.iterator]() { console.log("open"); return this; }
}
export class YieldingReturn extends Protocol {
  return(value) {
    console.log("return yields", value);
    return { value: "closing", done: false };
  }
}
export class NoThrow {
  next() { return { value: "no throw", done: false }; }
  return() { console.log("close absent throw"); return { value: undefined, done: true }; }
  [Symbol.iterator]() { return this; }
}
export class NoReturn {
  next() { return { value: "no return", done: false }; }
  [Symbol.iterator]() { return this; }
}
export class Broken {
  next() { return 7; }
  [Symbol.iterator]() { return this; }
}
