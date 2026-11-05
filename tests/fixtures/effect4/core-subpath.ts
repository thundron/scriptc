import * as Effect from "effect/Effect"
Effect.runPromise(Effect.succeed("world")).then((x: string) => console.log(x))
