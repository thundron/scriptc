import { Data, Equal } from "effect";
console.log(Equal.equals(Data.struct({ n: 42 }), Data.struct({ n: 42 })));
