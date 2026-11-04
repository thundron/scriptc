import { Effect, PubSub, Queue } from "effect";
const p = Effect.scoped(Effect.gen(function* () { const hub = yield* PubSub.unbounded<number>(); const a = yield* PubSub.subscribe(hub); const b = yield* PubSub.subscribe(hub); yield* PubSub.publish(hub, 42); console.log(yield* Queue.take(a), yield* Queue.take(b)); yield* PubSub.shutdown(hub); }));
Effect.runPromise(p);
