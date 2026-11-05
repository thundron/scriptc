import { Effect } from "effect";

const program = Effect.gen(function* () {
  const name = yield* Effect.succeed("world");
  yield* Effect.sync(() => console.log("Hello, " + name + "!"));
  return 42;
});

Effect.runPromise(program).then((value: number) => console.log(value));
