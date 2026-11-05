import { Context, Effect, Layer } from "effect";
const Count = Context.GenericTag<number>("Count");
let closed = false;
const live = Layer.scoped(Count, Effect.acquireRelease(Effect.succeed(42), () => Effect.sync(() => { closed = true; })));
Effect.runPromise(Effect.provide(Count, live)).then((n: number) => console.log(n, closed));
