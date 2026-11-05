import { isDeepStrictEqual } from "node:util";
const compare: typeof isDeepStrictEqual = isDeepStrictEqual;
const value: boolean = compare({ data: [1, 2] }, { data: [1, 2] });
console.log(value, isDeepStrictEqual(1, 1));
