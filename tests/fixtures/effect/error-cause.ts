import { Effect, Cause, Option } from "effect";
Effect.runPromise(Effect.exit(Effect.fail("bad"))).then((e) => { if (e._tag === "Failure") { console.log(Option.getOrElse(Cause.failureOption(e.cause), () => "missing")); console.log(Cause.pretty(e.cause)); } });
