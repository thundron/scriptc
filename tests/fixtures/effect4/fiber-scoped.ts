import * as Effect from "effect/Effect"
import * as Fiber from "effect/Fiber"
Effect.runPromise((Effect.gen(function*(){ let stopped=false; const f=yield* Effect.forkScoped(Effect.never.pipe(Effect.onInterrupt(()=>Effect.sync(()=>{stopped=true}))),{startImmediately:true}); yield* Fiber.interrupt(f); return stopped; }).pipe(Effect.scoped)).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
