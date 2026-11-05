import { Effect } from "effect"
const program = Effect.gen(function* () { const name = yield* Effect.succeed("world"); return "Hello, " + name + "!" })
Effect.runPromise(program).then((x: string) => console.log(x))
