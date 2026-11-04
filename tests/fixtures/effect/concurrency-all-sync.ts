import { Effect } from "effect";
Effect.runPromise(Effect.all([Effect.succeed(1), Effect.succeed(2)], { concurrency: 2 })).then((a: number[]) => console.log(a.join(",")));
