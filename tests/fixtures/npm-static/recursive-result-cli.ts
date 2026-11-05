import { wrap } from "recursive-result";

const error = wrap({ message: "outer", cause: { message: "inner" } });
console.log(error.message);
console.log((error.cause as Error).message);
