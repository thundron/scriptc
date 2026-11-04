import * as Result from "effect/Result"
console.log(Result.match(Result.map(Result.succeed(21),n=>n*2),{onFailure:()=>0,onSuccess:n=>n}))
