import { Effect } from "effect";
Effect.runPromise(Effect.async<number>((resume) => resume(Effect.succeed(42)))).then((n: number) => console.log(n));
