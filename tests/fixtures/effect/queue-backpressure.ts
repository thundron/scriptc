import { Effect, Queue, Fiber } from "effect";
const p = Effect.gen(function* () { const q = yield* Queue.bounded<number>(1); yield* Queue.offer(q, 1); const f = yield* Effect.fork(Queue.offer(q, 2)); const a = yield* Queue.take(q); yield* Fiber.join(f); const b = yield* Queue.take(q); yield* Queue.shutdown(q); console.log(a, b); });
Effect.runPromise(p);
