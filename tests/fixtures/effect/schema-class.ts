import { Schema } from "effect";
class Person extends Schema.Class<Person>("Person")({ name: Schema.String }) {}
console.log(new Person({ name: "Ada" }).name);
