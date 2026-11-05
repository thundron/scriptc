import * as Effect from "effect/Effect"
Effect.runPromise((Effect.gen(function*(){yield* Effect.annotateCurrentSpan({id:1});const s=yield* Effect.currentSpan;return [s.name,s.attributes.get("id")] }).pipe(Effect.withSpan("test"))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
