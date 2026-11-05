import { Effect, Option } from "effect";
Effect.runPromise(Effect.option(Effect.fail("bad"))).then((o) => console.log(Option.isNone(o)));
