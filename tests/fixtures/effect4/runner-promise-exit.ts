import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
Effect.runPromiseExit(Effect.fail("oops")).then((x:Exit.Exit<never,string>) => console.log(Exit.isFailure(x) ? JSON.stringify(x.cause) : "success"))
