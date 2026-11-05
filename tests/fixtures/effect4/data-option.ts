import * as Option from "effect/Option"
console.log(Option.getOrElse(Option.map(Option.some(2), n => n + 1), () => 0))
