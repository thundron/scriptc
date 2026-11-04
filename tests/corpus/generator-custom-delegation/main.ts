import { asIterable, Protocol, YieldingReturn, NoThrow, NoReturn, Broken } from "./iterators.js";

function* run(value: unknown): Generator<string, string, unknown> {
  try {
    const result = yield* asIterable(value);
    console.log("body", result);
    return "body:" + (result as string);
  } finally {
    console.log("finally");
  }
}
const normal = run(new Protocol());
console.log(normal.next().value);
console.log(normal.next("sent").value);
const returned = run(new Protocol());
console.log(returned.next().value);
console.log(returned.return("early").value);
const thrown = run(new Protocol());
console.log(thrown.next().value);
console.log(thrown.throw("problem").value);
const yielding = run(new YieldingReturn());
console.log(yielding.next().value);
console.log(yielding.return("early").value);
console.log(yielding.next("after close yield").value);
const noThrow = run(new NoThrow());
console.log(noThrow.next().value);
try { noThrow.throw("problem"); } catch (error) { console.log((error as Error).name); }
const noReturn = run(new NoReturn());
console.log(noReturn.next().value);
console.log(noReturn.return("sent return").value);
try { run(new Broken()).next(); } catch (error) { console.log((error as Error).name); }
