import { Effect } from "effect";
let calls = 0;
const p = Effect.gen(function* () { const cached = yield* Effect.cached(Effect.sync(() => ++calls)); console.log(yield* cached, yield* cached, calls); });
Effect.runPromise(p);
