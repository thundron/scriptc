let nextReads = 0;
let valueReads = 0;
let closes = 0;
export const failure = new Error("iterator failure");
export function counters() { return [nextReads, valueReads, closes].join(","); }
export function make(mode) {
  nextReads = 0; valueReads = 0; closes = 0;
  const cursor = { [Symbol.iterator]() { return this; } };
  let count = 0;
  Object.defineProperty(cursor, "next", { get() {
    nextReads++;
    return () => {
      if (mode === "next") throw failure;
      const index = count++;
      return {
        get done() { if (mode === "done") throw failure; return index === 2; },
        get value() { valueReads++; if (mode === "value") throw failure; return index + 10; },
      };
    };
  } });
  Object.defineProperty(cursor, "return", { get() {
    closes++;
    if (mode === "close getter") throw new Error("close getter failed");
    return () => { closes++; if (mode === "close call") throw new Error("close failed"); return { done: true }; };
  } });
  return Object.create(cursor);
}

export function entries(mode) {
  nextReads = 0;
  valueReads = 0;
  closes = 0;
  const cursor = { [Symbol.iterator]() { return this; } };
  Object.defineProperty(cursor, "next", { get() {
    nextReads++;
    let index = 0;
    return () => ({ done: index++ === 2, value: mode === "primitive" ? 3 : {
      get 0() { valueReads++; if (mode === "key") throw failure; return "same"; },
      get 1() { valueReads++; if (mode === "value") throw failure; return index; },
    } });
  } });
  Object.defineProperty(cursor, "return", { value() { closes++; return { done: true }; } });
  return Object.create(cursor);
}

export function arrayLike() { return Object.assign(Object.create(null), { 0: 5, 1: 6, length: 2 }); }

export function changed() {
  let index = 0;
  return Object.assign(Object.create(null), {
    [Symbol.iterator]() { return this; },
    next() {
      this.next = () => ({ done: true, value: undefined });
      return { done: index++ === 2, value: index };
    },
  });
}
