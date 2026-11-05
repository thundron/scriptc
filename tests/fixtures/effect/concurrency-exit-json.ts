import { Effect } from "effect";
Effect.runPromiseExit(Effect.all([Effect.succeed(1), Effect.succeed(2)], { concurrency: 2 })).then((e: object) => console.log(JSON.stringify(e)));
