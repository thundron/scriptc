import { factory } from "variadic-factory";
const add = factory((value: number) => value * 2);
console.log(add(2, 5));
