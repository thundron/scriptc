import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
Effect.runPromise((Schema.decodeUnknownEffect(Schema.Struct({name:Schema.String}))({name:"world"}).pipe(Effect.flatMap(value=>Schema.encodeEffect(Schema.Struct({name:Schema.String}))(value)))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
