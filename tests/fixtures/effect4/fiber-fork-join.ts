import * as Effect from "effect/Effect"
import * as Fiber from "effect/Fiber"
Effect.runPromise((Effect.gen(function* () { const f=yield* Effect.forkChild(Effect.succeed(42)); return yield* Fiber.join(f); })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
