import { Effect } from "effect";
const c = new AbortController();
const result = Effect.runPromiseExit(Effect.never, { signal: c.signal });
c.abort();
result.then((e) => console.log(e._tag));
