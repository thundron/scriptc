import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
const x=Effect.runSyncExit(Effect.fail("oops")); console.log(Exit.isFailure(x) ? x.cause.reasons[0]?._tag : "success")
