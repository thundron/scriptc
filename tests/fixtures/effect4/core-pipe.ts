import * as Effect from "effect/Effect"
import * as Function from "effect/Function"
Effect.runPromise((Function.pipe(Effect.succeed(20), Effect.map(n => n+1), Effect.flatMap(n => Effect.succeed(n*2)))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
