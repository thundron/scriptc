import * as Effect from "effect/Effect"
import * as Result from "effect/Result"
Effect.runPromise((Effect.gen(function* () { const a=yield* Effect.fromResult(Result.succeed(42)); return a; })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
