import { inspect } from "./consumer.js";

const first = Symbol("key");
const second = Symbol("key");
const shared = Symbol.for("shared");
const store = new Map<unknown, unknown>();
store.set(first, "first");
store.set(second, "second");
store.set(shared, "shared");
const result: unknown = inspect(first, second, shared, store);
console.log((result as symbol) === first, store.get(first), store.size);
console.log(result === first, result !== second, first === result, second !== result);
