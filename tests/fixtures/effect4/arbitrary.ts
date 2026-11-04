import * as Effect from "effect/Effect"
import * as Arbitrary from "effect/Arbitrary"
import * as Schema from "effect/Schema"
Effect.runPromise(Arbitrary.sampleEffect(Arbitrary.schema(Schema.Literal(42)),{seed:1,count:3}).pipe(Effect.tap(v=>Effect.sync(()=>console.log(JSON.stringify(v))))))
