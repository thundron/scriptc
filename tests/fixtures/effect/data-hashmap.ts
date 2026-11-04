import { HashMap, Option } from "effect";
console.log(Option.getOrElse(HashMap.get(HashMap.make(["a", 42]), "a"), () => 0));
