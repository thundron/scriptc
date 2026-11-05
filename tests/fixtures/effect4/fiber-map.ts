import * as Effect from "effect/Effect"
import * as FiberMap from "effect/FiberMap"
import * as Fiber from "effect/Fiber"
Effect.runPromise((Effect.gen(function*(){const m=yield* FiberMap.make<string,number,never>();const f=yield* FiberMap.run(m,"job",Effect.succeed(42));return yield* Fiber.join(f)}).pipe(Effect.scoped)).pipe(Effect.tap(v=>Effect.sync(()=>console.log(JSON.stringify(v))))))
