import * as Effect from "effect/Effect"
import * as Cause from "effect/Cause"
Effect.runPromise((Effect.fail("oops").pipe(Effect.catchCause(c => Effect.succeed([Cause.hasFails(c),c.reasons.map(r=>r._tag)])))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
