import { Effect } from "effect";
Effect.runPromise(Effect.either(Effect.fail("bad"))).then((e: object) => console.log(JSON.stringify(e)));
