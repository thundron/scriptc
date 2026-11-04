import * as Effect from "effect/Effect"
import * as Ref from "effect/Ref"
Effect.runPromise((Effect.gen(function* () { const r=yield* Ref.make(40); yield* Ref.update(r,n=>n+2); return yield* Ref.get(r); })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
