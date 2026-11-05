import * as Schema from "effect/Schema"
import * as Exit from "effect/Exit"
const S=Schema.Struct({age:Schema.Int}); const x=Schema.decodeUnknownExit(S)({age:"bad"}); console.log(Exit.isFailure(x))
