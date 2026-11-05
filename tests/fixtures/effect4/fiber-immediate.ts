import * as Effect from "effect/Effect"
import * as Fiber from "effect/Fiber"
Effect.runPromise((Effect.gen(function* () { const events:string[]=[]; const f=yield* Effect.forkChild(Effect.sync(()=>{events.push("child")}),{startImmediately:true}); events.push("parent"); yield* Fiber.join(f); return events; })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
