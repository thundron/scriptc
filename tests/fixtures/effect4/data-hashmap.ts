import * as HashMap from "effect/HashMap"
import * as Option from "effect/Option"
console.log(Option.getOrElse(HashMap.get(HashMap.make(["x",42]),"x"),()=>0))
