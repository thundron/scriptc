export {};

class CompilerError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "CompilerError";
  }
}
class Derived extends CompilerError {}
class Inherited extends TypeError {}
class DeepInherited extends Inherited {}

function report(label: string, error: Error): void {
  console.log(label, error.name, JSON.stringify(error.message), "cause" in error, error.cause);
}
function make(message?: string, options?: ErrorOptions): CompilerError {
  return new CompilerError(message, options);
}
report("absent", make());
report("empty", make("", {}));
report("explicit undefined", make(undefined, { cause: undefined }));
report("null", make("null cause", { cause: null }));
report("number", make("number cause", { cause: 42 }));
report("boolean", make("boolean cause", { cause: false }));
report("string", make("string cause", { cause: "root" }));
report("derived", new Derived("inherited", { cause: 7 }));
report("builtin chain", new DeepInherited(undefined, { cause: "root" }));
report("default chain", new DeepInherited());
report("Error", new Error("message", { cause: "error" }));
report("TypeError", new TypeError("message", { cause: "type" }));
report("RangeError", new RangeError("message", { cause: "range" }));
report("SyntaxError", new SyntaxError("message", { cause: "syntax" }));

// Forwarding the standard library interface keeps missing and undefined
// distinct even when the options travel through nullable control flow.
function forward(flag: number): Error {
  let options: ErrorOptions | undefined;
  if (flag === 1) options = {};
  if (flag === 2) options = { cause: undefined };
  if (flag === 3) options = { cause: "present" };
  return new Derived(undefined, options);
}
for (let flag = 0; flag < 4; flag++) report("forward " + flag, forward(flag));

const original: Error = new RangeError("underlying");
const wrapped = new CompilerError("wrapper", { cause: original });
const cause = wrapped.cause;
console.log("identity", cause instanceof Error && cause === original);
if (cause instanceof Error) console.log("cause class", cause.name, cause.message, cause instanceof RangeError);
console.log("class", wrapped instanceof Error, wrapped instanceof CompilerError, wrapped.toString());

// Constructor arguments run exactly once, left-to-right, before super's
// field initializers and the rest of the subclass body.
let events = "";
function message(): string { events += "message;"; return "value"; }
function options(): ErrorOptions { events += "options;"; return { cause: 5 }; }
function field(): number { events += "field;"; return 9; }
class Ordered extends Error {
  value = field();
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    events += "body;";
  }
}
const ordered = new Ordered(message(), options());
console.log("order", events, ordered.message, ordered.cause, ordered.value);
