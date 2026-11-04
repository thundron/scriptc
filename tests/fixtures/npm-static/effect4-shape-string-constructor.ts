import { CauseLike } from "effect4-shapes/constructor";
const value=new CauseLike(["Fail"]);
console.log(value.reasons.join(","),value["~effect/Cause"]);
