import { Effect } from "effect";
let calls = 0;
const p = Effect.gen(function* () { const f = yield* Effect.cachedFunction((n: number) => Effect.sync(() => { calls++; return n * 2; })); console.log(yield* f(21), yield* f(21), calls); });
Effect.runPromise(p);
