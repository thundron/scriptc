import { Effect } from "effect";
Effect.runPromise(Effect.sleep("1 millis")).then(() => console.log("slept"));
