import { Effect } from "effect";
Effect.runPromise(Effect.all({ count: Effect.succeed(42), name: Effect.succeed("world") })).then((v) => console.log(v.count, v.name));
