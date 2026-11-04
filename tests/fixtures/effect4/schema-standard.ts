import * as Schema from "effect/Schema"
const S=Schema.toStandardSchemaV1(Schema.Struct({n:Schema.Int}));console.log(JSON.stringify(S["~standard"].validate({n:42})))
