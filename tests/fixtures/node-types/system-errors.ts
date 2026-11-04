import * as util from "node:util";

const name: typeof util.getSystemErrorName = util.getSystemErrorName;
const message: typeof util.getSystemErrorMessage = util.getSystemErrorMessage;
const all: typeof util.getSystemErrorMap = util.getSystemErrorMap;
const errors: Map<number, [string, string]> = all();
const pair: [string, string] | undefined = errors.get(-3001);
console.log(name(-3001), message(-3001), pair?.[0], pair?.[1], errors.size);
