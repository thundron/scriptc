import { Effect, Request, RequestResolver } from "effect";
interface Double extends Request.Request<number> { readonly _tag: "Double"; readonly value: number; }
const Double = Request.tagged<Double>("Double");
const resolver = RequestResolver.fromFunction((request: Double) => request.value * 2);
Effect.runPromise(Effect.request(Double({ value: 21 }), resolver)).then((n: number) => console.log(n));
