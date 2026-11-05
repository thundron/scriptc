import { Data } from "effect";
class Person extends Data.TaggedClass("Person")<{ readonly name: string }> {}
const p = new Person({ name: "Ada" });
console.log(p._tag, p.name);
