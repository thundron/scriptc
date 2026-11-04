import * as Schema from "effect/Schema"
const S=Schema.fromJsonString(Schema.Struct({n:Schema.Int})); const d=Schema.decodeSync(S)('{"n":42}'); console.log(Schema.encodeSync(S)(d))
