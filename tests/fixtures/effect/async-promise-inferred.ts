import { Effect } from "effect";
const p = Effect.gen(function* () { const n = yield* Effect.promise(() => Promise.resolve(21)); return n * 2; });
Effect.runPromise(p).then((n: number) => console.log(n));
