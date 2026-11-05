import * as Effect from "effect/Effect"
Effect.runPromise((Effect.gen(function* () { let calls=0;const get=yield* Effect.cached(Effect.sync(()=>++calls));return [yield* get,yield* get,calls]; })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
