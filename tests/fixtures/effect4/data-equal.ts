import * as Equal from "effect/Equal"
import * as Hash from "effect/Hash"
console.log(Equal.equals({a:[1,2]},{a:[1,2]}),Hash.hash({a:1})===Hash.hash({a:1}))
