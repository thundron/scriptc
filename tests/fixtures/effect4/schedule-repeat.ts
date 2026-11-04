import * as Effect from "effect/Effect"
import * as Schedule from "effect/Schedule"
let n=0; Effect.runPromise((Effect.sync(()=>++n).pipe(Effect.repeat(Schedule.recurs(2)),Effect.map(()=>n))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
