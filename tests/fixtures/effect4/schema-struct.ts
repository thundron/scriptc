import { Schema } from "effect"
const S = Schema.Struct({name: Schema.String, age: Schema.Int})
console.log(JSON.stringify(Schema.decodeUnknownSync(S)({name:"world", age:42})))
