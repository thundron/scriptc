import { Effect, Logger } from "effect"

const program = Effect.gen(function* () {
  const name = yield* Effect.succeed("world")
  yield* Effect.log("Hello, " + name + "!")
})

Effect.runPromise(program.pipe(Effect.provide(Logger.layer([
  Logger.make(({ message }) => console.log(message))
]))))
