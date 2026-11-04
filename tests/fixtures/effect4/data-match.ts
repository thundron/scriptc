import * as Match from "effect/Match"
const value={_tag:"Ok" as const,n:42}; console.log(Match.value(value).pipe(Match.tag("Ok",x=>x.n),Match.exhaustive))
