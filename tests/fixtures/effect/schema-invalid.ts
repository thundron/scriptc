import { Schema, Either } from "effect";
const Person = Schema.Struct({ name: Schema.String, age: Schema.Number });
console.log(Either.isLeft(Schema.decodeUnknownEither(Person)({ name: "Ada", age: "bad" })));
