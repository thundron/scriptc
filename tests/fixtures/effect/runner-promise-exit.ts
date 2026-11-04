import { Effect } from "effect";
Effect.runPromiseExit(Effect.fail("nope")).then((exit) => console.log(exit._tag));
