import { pipe } from "effect/Function"
import * as Array from "effect/Array"
console.log(JSON.stringify(pipe(Array.range(1,4),Array.map(n=>n*2),Array.filter(n=>n>4))))
