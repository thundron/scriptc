import * as Effect from "effect/Effect";const p:Effect.Effect<number>=Effect.gen(function*(){return yield* Effect.succeed(42)});Effect.runPromise(p).then((n:number)=>console.log(n))
