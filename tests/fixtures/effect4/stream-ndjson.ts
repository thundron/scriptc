import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import * as Schema from "effect/Schema"
import * as Ndjson from "effect/encoding/Ndjson"
Effect.runPromise((Stream.make('{"n":1}\n{"n":2}\n').pipe(Stream.pipeThroughChannel(Ndjson.decodeSchemaString(Schema.Struct({n:Schema.Int}))()),Stream.map(v=>({n:v.n*2})),Stream.pipeThroughChannel(Ndjson.encodeSchemaString(Schema.Struct({n:Schema.Int}))()),Stream.runCollect)).pipe(Effect.tap(v=>Effect.sync(()=>console.log(JSON.stringify(v))))))
