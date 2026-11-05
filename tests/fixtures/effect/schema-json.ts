import { Schema } from "effect";
const S = Schema.parseJson(Schema.Struct({ n: Schema.Number }));
const v = Schema.decodeUnknownSync(S)('{"n":42}');
console.log(v.n, Schema.encodeSync(S)(v));
