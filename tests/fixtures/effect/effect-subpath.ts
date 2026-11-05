import * as Effect from "effect/Effect";
Effect.runPromise(Effect.gen(function* () { yield* Effect.succeed("world"); return 42; })).then((n: number) => console.log(n));
