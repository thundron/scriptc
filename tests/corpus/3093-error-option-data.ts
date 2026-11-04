export {};

// Data-bearing class options cross the typed-reference boundary lazily.
class Options {
  cause: string;
  constructor(cause: string) { this.cause = cause; }
}
class DerivedOptions extends Options {}
function wrap(options: ErrorOptions): Error {
  return new Error("wrapped", options);
}
const options = new DerivedOptions("first");
const forwarded: ErrorOptions = options;
options.cause = "second";
const error = wrap(forwarded);
options.cause = "third";
console.log("class options", error.message, error.cause, "cause" in error);

// An ordinary data record and the named interface agree about presence.
const record = { cause: "record" };
console.log("record options", new TypeError("typed", record).cause);
const empty: ErrorOptions = {};
const present: ErrorOptions = { cause: undefined };
console.log("presence", "cause" in wrap(empty), "cause" in wrap(present));

// Passing options through a closure must preserve identity of its cause.
const root: Error = new Error("root", { cause: "deep" });
function wrapper(cause: unknown): () => Error {
  const saved: ErrorOptions = { cause };
  return () => new Error("outer", saved);
}
const make = wrapper(root);
const outer = make();
const nested = outer.cause;
if (nested instanceof Error) {
  console.log("nested", nested === root, nested.message, nested.cause);
}

// Argument evaluation happens before message conversion; conversion may
// throw before super returns and before subclass field initialization.
let order = "";
function getOptions(): ErrorOptions { order += "options;"; return { cause: 3 }; }
const message: any = {
  toString(): string { order += "toString;"; return "converted"; },
};
console.log("message", new Error(message, getOptions()).message, order);
let initialized = 0;
function field(): string { initialized++; return "field"; }
class Failing extends Error {
  detail = field();
  constructor(message: any) { super(message, { cause: "owned" }); }
}
const throwing: any = { toString(): string { throw new RangeError("coercion"); } };
for (let i = 0; i < 20; i++) {
  try { new Failing(throwing); }
  catch (caught) {
    if (i === 0 && caught instanceof Error) console.log("throw", caught.name, caught.message);
  }
}
try { new Error(throwing); }
catch (caught) { if (caught instanceof Error) console.log("builtin throw", caught.message); }
console.log("initializers", initialized);
