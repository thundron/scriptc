import { Effect } from "effect";
Effect.runPromise(Effect.all([Effect.succeed(1), Effect.succeed("two")] as const)).then(([a, b]) => console.log(a, b));
