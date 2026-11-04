import { Effect } from "effect";
const p = Effect.gen(function* () { const n = yield* Effect.sync(() => 42); return n; });
Effect.runPromise(p).then((n: number) => console.log(n));
