import { Context, Effect, Layer } from "effect";
const Count = Context.GenericTag<number>("Count");
Effect.runPromise(Effect.provide(Count, Layer.effect(Count, Effect.succeed(42)))).then((n: number) => console.log(n));
