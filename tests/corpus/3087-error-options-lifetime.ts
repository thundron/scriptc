export {};

class DetailedError extends Error {
  detail: string;
  constructor(message: string | undefined, detail: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DetailedError";
    this.detail = detail;
  }
}
function raise(index: number): never {
  const source: Error = new TypeError("source " + index);
  throw new DetailedError("outer " + index, "detail " + index, { cause: source });
}
let total = 0;
for (let i = 0; i < 80; i++) {
  try {
    raise(i);
  } catch (error) {
    if (error instanceof DetailedError) {
      const cause = error.cause;
      if (cause instanceof Error) {
        total += cause.message.length + error.detail.length;
        if (i === 0 || i === 79) console.log(error.name, error.message, cause.name, cause.message);
      }
    }
  }
}
console.log("retained", total);

function borrowedOptions(cause: unknown): Error {
  const options: ErrorOptions = { cause };
  return new Error(undefined, options);
}
const original: Error = new SyntaxError("identity");
const a = borrowedOptions(original);
const b = borrowedOptions(original);
const ac = a.cause;
const bc = b.cause;
console.log("shared", ac instanceof Error && ac === original, bc instanceof Error && bc === original);

// Constructor unwind releases an installed cause and initialized fields.
let failures = 0;
class Failed extends Error {
  note = "owned field";
  constructor(options: ErrorOptions) {
    super("partial", options);
    throw new Error("constructor failed");
  }
}
for (let i = 0; i < 40; i++) {
  try { new Failed({ cause: "owned cause " + i }); }
  catch (error) { if (error instanceof Error) failures += error.message.length; }
}
console.log("unwind", failures);

// A cause survives both an upcast and an unknown boundary with identity.
const untyped: unknown = new DetailedError("boxed", "details", { cause: original });
if (untyped instanceof Error) {
  const boxedCause = untyped.cause;
  console.log("boxed", "cause" in untyped, boxedCause instanceof Error && boxedCause === original);
}
