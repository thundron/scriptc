import { Effect } from "effect";
const p = Effect.gen(function* () { const n = yield* Effect.succeed(20); const result = yield* Effect.sync(() => n + 22); return result; });
Effect.runPromise(p).then((n: number) => console.log(n));
