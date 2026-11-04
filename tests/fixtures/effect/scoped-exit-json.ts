import { Effect } from "effect";
Effect.runPromiseExit(Effect.scoped(Effect.succeed(42))).then((e: object) => console.log(JSON.stringify(e)));
