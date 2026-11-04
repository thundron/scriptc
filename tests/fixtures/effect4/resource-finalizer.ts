import * as Effect from "effect/Effect"
const events:string[]=[]; Effect.runPromise((Effect.gen(function*(){yield* Effect.addFinalizer(()=>Effect.sync(()=>{events.push("finalized")}));return 42}).pipe(Effect.scoped,Effect.map(n=>[n,events]))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
