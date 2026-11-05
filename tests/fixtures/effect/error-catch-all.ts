import { Effect } from "effect";
Effect.runPromise(Effect.catchAll(Effect.fail("nope"), (s: string) => Effect.succeed("recovered:" + s))).then((s: string) => console.log(s));
