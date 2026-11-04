import * as Effect from "effect/Effect"
import * as Fiber from "effect/Fiber"
const f=Effect.runFork(Effect.succeed(42)); Effect.runPromise((Fiber.join(f)).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
