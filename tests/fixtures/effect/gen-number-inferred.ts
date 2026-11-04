import { Effect } from "effect";
const p = Effect.gen(function* () { const n = yield* Effect.succeed(42); console.log("yielded", n); return n; });
Effect.runPromise(p).then((n: number) => console.log("returned", n));
