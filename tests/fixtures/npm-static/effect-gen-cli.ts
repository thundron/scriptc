import { Effect } from "effect";

const program = Effect.gen(function* () {
  const name = yield* Effect.succeed("world");
  yield* Effect.log("Hello, " + name + "!");
});

Effect.runPromise(program);
