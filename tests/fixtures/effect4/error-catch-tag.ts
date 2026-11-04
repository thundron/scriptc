import * as Effect from "effect/Effect"
import * as Data from "effect/Data"
class Missing extends Data.TaggedError("Missing")<{readonly id:number}> {}
Effect.runPromise((Effect.fail(new Missing({id:1})).pipe(Effect.catchTag("Missing", e => Effect.succeed(e.id)))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
