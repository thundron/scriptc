import * as Effect from "effect/Effect"
const events:string[]=[]; const p=Effect.gen(function*(){ const r=yield* Effect.acquireRelease(Effect.succeed(42),()=>Effect.sync(()=>{events.push("released")})); return r }).pipe(Effect.scoped,Effect.map(n=>[n,events])); Effect.runPromise((p).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
