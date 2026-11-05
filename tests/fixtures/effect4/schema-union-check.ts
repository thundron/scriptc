import * as Schema from "effect/Schema"
const S=Schema.Union([Schema.Literals(["admin","member"]),Schema.Number.check(Schema.isGreaterThan(0))]); console.log(Schema.decodeUnknownSync(S)(42))
