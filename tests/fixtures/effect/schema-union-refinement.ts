import { Schema, Either } from "effect";
const Positive = Schema.Number.pipe(Schema.filter((n: number) => n > 0));
const S = Schema.Struct({ kind: Schema.Union(Schema.Literal("a"), Schema.Literal("b")), count: Positive });
console.log(Schema.decodeUnknownSync(S)({ kind: "a", count: 2 }).kind);
console.log(Either.isLeft(Schema.decodeUnknownEither(S)({ kind: "b", count: -1 })));
