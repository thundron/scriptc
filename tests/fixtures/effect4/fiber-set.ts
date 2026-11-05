import * as Effect from "effect/Effect"
import * as FiberSet from "effect/FiberSet"
import * as Fiber from "effect/Fiber"
Effect.runPromise((Effect.gen(function*(){const s=yield* FiberSet.make<number,never>();const f=yield* FiberSet.run(s,Effect.succeed(42));return yield* Fiber.join(f)}).pipe(Effect.scoped)).pipe(Effect.tap(v=>Effect.sync(()=>console.log(JSON.stringify(v))))))
