import { Effect, Queue } from "effect";
const p = Effect.gen(function* () { const q = yield* Queue.unbounded<number>(); yield* Queue.offer(q, 42); const n = yield* Queue.take(q); yield* Queue.shutdown(q); return n; });
Effect.runPromise(p).then((n: number) => console.log(n));
