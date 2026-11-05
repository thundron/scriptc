import { Effect, Fiber } from "effect";
const fiber = Effect.runFork(Effect.succeed(42));
Effect.runPromise(Fiber.join(fiber)).then((n: number) => console.log(n));
