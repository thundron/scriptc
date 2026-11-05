import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
class Missing extends Schema.TaggedError<Missing>()("Missing",{id:Schema.Int}) {} Effect.runPromise((Effect.fail(new Missing({id:42})).pipe(Effect.catchTag("Missing",e=>Effect.succeed(e.id)))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
