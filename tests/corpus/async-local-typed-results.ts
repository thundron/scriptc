// @transform-types
import { AsyncLocalStorage } from "node:async_hooks";

class Context {
  count = 0;
  readonly entries = new Map<string, number>();
  constructor(readonly name: string) {}
  bump(): string { this.count++; this.entries.set(this.name, this.count); return this.name + ":" + this.count; }
}

const store = new AsyncLocalStorage<Context>();
const outer = new Context("outer");
const inner = new Context("inner");
console.log("empty", store.getStore() === undefined);
const returned = store.run(outer, () => {
  console.log("identity", store.getStore() === outer);
  console.log("method", store.getStore()?.bump());
  const context = store.getStore();
  if (context !== undefined) console.log("local", context.bump());
  const nested = store.run(inner, (suffix: string) => {
    console.log("nested", store.getStore() === inner, store.getStore()?.bump(), suffix);
    return store.getStore()!;
  }, "argument");
  console.log("nested return", nested === inner, nested.bump());
  const absent = store.exit(() => store.getStore());
  console.log("exit", absent === undefined, store.getStore() === outer);
  console.log("exit value", store.exit(() => 42));
  console.log("exit class", store.exit(() => inner) === inner);
  try { store.run(inner, () => { throw new Error("nested failure"); }); }
  catch (error) { console.log("throw", error instanceof Error, store.getStore() === outer); }
  return outer;
});
console.log("return", returned === outer, returned.bump(), store.getStore() === undefined);
const scalar = new AsyncLocalStorage<number>();
console.log("scalar", scalar.run(12, () => scalar.getStore()! + 5));
const text = new AsyncLocalStorage<string>();
console.log("text", text.run("text", () => text.getStore()?.toUpperCase()));
store.enterWith(inner);
console.log("enter", store.getStore() === inner);
store.disable();
console.log("disable", store.getStore() === undefined);

async function later(label: string): Promise<void> {
  const before = store.getStore();
  await Promise.resolve(0);
  const after = store.getStore();
  console.log("await", label, before === after, after?.bump());
}
store.run(outer, () => { later("a"); });
store.run(inner, () => { later("b"); });
console.log("scheduled", store.getStore() === undefined);
