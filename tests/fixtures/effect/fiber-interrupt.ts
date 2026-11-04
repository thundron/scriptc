import { Effect, Fiber } from "effect";
const p = Effect.gen(function* () {
 const f = yield* Effect.fork(Effect.onInterrupt(Effect.never, () => Effect.sync(() => console.log("interrupted"))));
 yield* Effect.yieldNow();
 const e = yield* Fiber.interrupt(f);
 return e._tag;
});
Effect.runPromise(p).then((s: string) => console.log(s));
