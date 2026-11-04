import { Effect } from "effect";
const p = Effect.validateAll([1, 2, 3], (n: number) => n === 2 ? Effect.fail("bad:2") : Effect.succeed(n));
Effect.runPromise(Effect.match(p, { onFailure: (es) => es.join(","), onSuccess: (ns) => ns.join(",") })).then((s: string) => console.log(s));
