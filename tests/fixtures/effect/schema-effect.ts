import { Schema, Effect } from "effect";
const p = Schema.decodeUnknown(Schema.NumberFromString)("42");
Effect.runPromise(p).then((n: number) => console.log(n));
