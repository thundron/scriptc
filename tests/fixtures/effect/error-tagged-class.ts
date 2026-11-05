import { Data, Effect } from "effect";
class Missing extends Data.TaggedError("Missing")<{ readonly id: number }> {}
Effect.runPromise(Effect.catchTag(Effect.fail(new Missing({ id: 7 })), "Missing", (e) => Effect.succeed(e.id))).then((n: number) => console.log(n));
