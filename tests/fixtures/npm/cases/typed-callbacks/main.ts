// @dynamic
// TYPED parameters on island-marshaled callbacks: each incoming engine
// argument converts to the param's declared static type at call time
// through the validated-exit machinery — strict primitives, JSON
// round-trip records (width-tolerant: the package's surplus keys are
// ignored), `T | undefined` taking the undefined arm when the argument is
// absent, surplus arguments dropped (JS call semantics). Async callbacks
// return a real thenable the package can await; a rejection crosses as a
// real engine Error. Results are compared with Node.
import { catching, chainCatchLog, chainLog, classifyCaught, collectTwice, extraArgs, fire, maybe, opaqueRoundTrip, withBool, withNumbers, withOptions, withString } from "typedcb";

interface Opts {
  name: string;
  count: number;
  extra?: number[];
}

const sum: string = withNumbers((a: number, b: number) => a + b);
console.log(sum);

const up: string = withString((s: string) => s + s.length);
console.log(up);

const not: string = withBool((b: boolean) => !b);
console.log(not);

const describe = (s: string | undefined): string => (s === undefined ? "absent" : `got ${s}`);
const present: string = maybe(describe, true);
console.log(present);
const absent: string = maybe(describe, false);
console.log(absent);

const opts: string = withOptions((o: Opts) => {
  const extras: number = o.extra !== undefined ? o.extra.length : -1;
  return `${o.name}/${o.count}/${extras}`;
});
console.log(opts);

// The package passes five arguments; the declared three arrive, the rest
// drop (and the record param converts from the object in third position).
const extra: string = extraArgs((a: number, b: number, o: { tag: string }) => `${a + b}:${o.tag}`);
console.log(extra);

// An honest throw from a typed callback bridges exactly like the all-'any'
// callbacks' (the package catches a real TypeError instance).
const thrown: string = catching((n: number) => {
  if (n > 4) throw new TypeError(`too big: ${n}`);
  return n;
}, 5);
console.log(thrown);

console.log("reference", classifyCaught((n: number) => {
  if (n > 0) throw new ReferenceError("missing");
  return n;
}, 1));
console.log("eval", classifyCaught((n: number) => {
  if (n > 0) throw new EvalError("eval");
  return n;
}, 1));
console.log("uri", classifyCaught((n: number) => {
  if (n > 0) throw new URIError("uri");
  return n;
}, 1));

// A function with a DEFAULTED parameter as a value (commander's
// option-collector pattern): the completed signature's `string[] |
// undefined` param takes the undefined arm when the package omits the
// argument (which triggers the default), and the `string[]` return
// marshals back as a JSON deep copy the package hands to the next call.
function collect(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}
const collected: string = collectTwice(collect);
console.log(collected);

// Unknown callback arguments retain engine identity, including cyclic data
// and callable values; scalar values normalize without losing -0 or NaN.
console.log(opaqueRoundTrip((value: unknown): unknown => value));

// Async callbacks: the package awaits a real thenable (and logs
// island-side). The fulfillment marshals back; a rejection arrives as a
// real engine Error.
chainLog(async (s: string) => {
  return `${s}!`;
});

chainCatchLog(async (): Promise<void> => {
  throw new Error("boom");
});

// A fire-and-forget async callback: the package ignores the returned
// promise; the body still runs to completion on the shared loop.
const fired: string = fire(async (tag: string) => {
  console.log(`fired ${tag}`);
});
console.log(fired);
