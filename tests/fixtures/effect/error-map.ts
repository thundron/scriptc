import { Effect } from "effect";
const p = Effect.mapError(Effect.fail(21), (n: number) => "bad:" + n);
Effect.runPromise(Effect.catchAll(p, (s: string) => Effect.succeed(s))).then((s: string) => console.log(s));
Effect.runPromise(Effect.orElse(Effect.fail("bad"), () => Effect.succeed("fallback"))).then((s: string) => console.log(s));
