import * as Effect from "effect/Effect"
import * as Latch from "effect/Latch"
import * as Fiber from "effect/Fiber"
Effect.runPromise((Effect.gen(function* () { const l=yield* Latch.make(); const f=yield* Effect.forkChild(Latch.whenOpen(l,Effect.succeed(42))); yield* Latch.open(l); return yield* Fiber.join(f); })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
