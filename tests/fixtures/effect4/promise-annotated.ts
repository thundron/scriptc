import * as Effect from "effect/Effect";const p:Promise<number>=Effect.runPromise(Effect.succeed(42));p.then((n:number)=>console.log(n))
