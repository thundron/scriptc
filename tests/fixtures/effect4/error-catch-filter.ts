import * as Effect from "effect/Effect"
import * as Filter from "effect/Filter"
Effect.runPromise((Effect.fail(42).pipe(Effect.catchFilter(Filter.fromPredicate((n:number)=>n===42), n=>Effect.succeed(n+1)))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
