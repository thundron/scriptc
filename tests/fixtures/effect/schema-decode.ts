import { Schema } from "effect";
const Person = Schema.Struct({ name: Schema.String, age: Schema.Number });
const p = Schema.decodeUnknownSync(Person)({ name: "Ada", age: 42 });
console.log(p.name, p.age);
