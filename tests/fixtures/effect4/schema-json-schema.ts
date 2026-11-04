import * as Schema from "effect/Schema"
const d=Schema.toJsonSchemaDocument(Schema.Struct({name:Schema.String}));console.log(JSON.stringify(d))
