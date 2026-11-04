import * as Effect from "effect/Effect"
import * as Schedule from "effect/Schedule"
let n=0; Effect.runPromise((Effect.suspend(()=>++n<3?Effect.fail("again"):Effect.succeed(n)).pipe(Effect.retry(Schedule.recurs(3)))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
