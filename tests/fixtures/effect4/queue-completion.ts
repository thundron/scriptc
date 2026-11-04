import * as Effect from "effect/Effect"
import * as Queue from "effect/Queue"
import * as Cause from "effect/Cause"
Effect.runPromise((Effect.gen(function* () { const q=yield* Queue.unbounded<number,Cause.Done>(); yield* Queue.offerAll(q,[1,2]); yield* Queue.end(q); return yield* Queue.collect(q); })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
