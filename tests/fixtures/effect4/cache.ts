import * as Effect from "effect/Effect"
import * as Cache from "effect/Cache"
Effect.runPromise((Effect.gen(function* () { let calls=0;const c=yield* Cache.make({capacity:10,timeToLive:"1 minute",lookup:(key:string)=>Effect.sync(()=>{calls++;return key.length})});const a=yield* Cache.get(c,"world");const b=yield* Cache.get(c,"world");yield* Cache.invalidate(c,"world");const d=yield* Cache.get(c,"world");return [a,b,d,calls]; })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
