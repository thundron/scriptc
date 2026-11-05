import * as Effect from "effect/Effect"
const events:string[]=[]; Effect.runPromise((Effect.succeed(42).pipe(Effect.ensuring(Effect.sync(()=>{events.push("finalized")})),Effect.map(n=>[n,events]))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
