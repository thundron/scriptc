import * as Schema from "effect/Schema"
const S=Schema.Struct({name:Schema.String,age:Schema.optionalKey(Schema.Int)});console.log(JSON.stringify(Schema.decodeUnknownSync(S)({name:"world"})))
