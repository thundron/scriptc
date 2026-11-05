import { Effect } from "effect";
const p = Effect.match(Effect.fail("bad"), { onFailure: (s: string) => "failed:" + s, onSuccess: () => "ok" });
Effect.runPromise(p).then((s: string) => console.log(s));
