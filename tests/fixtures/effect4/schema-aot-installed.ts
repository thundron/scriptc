import * as Schema from "effect/Schema";
import {install} from "./schema-aot-generated.js";
const S=Schema.Struct({n:Schema.Int});
install([S.ast]);
console.log(JSON.stringify(Schema.decodeUnknownSync(S)({n:42})),Schema.is(S)({n:42}),Schema.is(S)({n:"bad"}));
