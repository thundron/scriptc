import * as Schema from "effect/Schema"
import * as SchemaRepresentation from "effect/SchemaRepresentation"
const r=SchemaRepresentation.toRepresentation(Schema.Struct({name:Schema.String}).ast);console.log(JSON.stringify(SchemaRepresentation.toJson(r)))
