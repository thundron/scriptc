import { Option, Either } from "effect";
console.log(Option.getOrElse(Option.map(Option.some(21), (n: number) => n * 2), () => 0));
console.log(Either.getOrElse(Either.map(Either.right(21), (n: number) => n * 2), () => 0));
