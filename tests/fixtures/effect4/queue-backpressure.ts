import * as Effect from "effect/Effect"
import * as Queue from "effect/Queue"
import * as Fiber from "effect/Fiber"
Effect.runPromise((Effect.gen(function* () { const q=yield* Queue.bounded<number>(1); yield* Queue.offer(q,1); const f=yield* Effect.forkChild(Queue.offer(q,2),{startImmediately:true}); const a=yield* Queue.take(q); yield* Fiber.join(f); const b=yield* Queue.take(q); return [a,b]; })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
