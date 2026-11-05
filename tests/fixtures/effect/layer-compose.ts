import { Context, Effect, Layer } from "effect";
const A = Context.GenericTag<number>("A");
const B = Context.GenericTag<string>("B");
const C = Context.GenericTag<string>("C");
const ab = Layer.merge(Layer.succeed(A, 42), Layer.succeed(B, "world"));
const c = Layer.effect(C, Effect.gen(function* () { const a = yield* A; const b = yield* B; return b + ":" + a; }));
Effect.runPromise(Effect.provide(C, Layer.provide(c, ab))).then((s: string) => console.log(s));
