import { Effect } from "effect";
const p = Effect.gen(function* () { const n = yield* Effect.succeed(20); return yield* Effect.sync(() => n + 22); });
Effect.runPromise(p).then((n: number) => console.log(n));
