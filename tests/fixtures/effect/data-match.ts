import { Match, pipe } from "effect";
type Result = { readonly _tag: "Ok"; readonly n: number } | { readonly _tag: "Bad"; readonly message: string };
function render(v: Result) {
 return pipe(Match.value(v), Match.tag("Ok", (r) => "ok:" + r.n), Match.tag("Bad", (r) => "bad:" + r.message), Match.exhaustive);
}
console.log(render({ _tag: "Ok", n: 42 }), render({ _tag: "Bad", message: "oops" }));
