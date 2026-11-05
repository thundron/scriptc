import { Effect, Option, Either } from "effect";
const p = Effect.gen(function* () { const a = yield* Option.some(20); const b = yield* Either.right(22); return a + b; });
Effect.runPromise(p).then((n: number) => console.log(n));
