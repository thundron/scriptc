import { Effect, Exit } from "effect";
console.log(Exit.isSuccess(Effect.runSyncExit(Effect.succeed(42))));
console.log(Exit.isFailure(Effect.runSyncExit(Effect.fail("nope"))));
