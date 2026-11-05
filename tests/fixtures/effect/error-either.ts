import { Effect, Either } from "effect";
Effect.runPromise(Effect.either(Effect.fail("bad"))).then((e) => console.log(Either.match(e, { onLeft: (s: string) => "left:" + s, onRight: () => "right" })));
