import { Effect } from "effect";
const p = Effect.gen(function* () { const name = yield* Effect.succeed("world"); yield* Effect.sync(() => console.log("Hello, " + name + "!")); return 42; });
Effect.runPromise(p).then((n: number) => console.log(n));
