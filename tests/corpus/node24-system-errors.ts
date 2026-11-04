import { getSystemErrorMap, getSystemErrorMessage, getSystemErrorName } from "node:util";
import * as util from "util";

const errors = getSystemErrorMap();
console.log("map", errors instanceof Map, errors.size);
for (const [code, pair] of errors) {
  console.log(code, pair[0], pair[1], getSystemErrorName(code), getSystemErrorMessage(code));
}

const fresh = getSystemErrorMap();
const first = errors.get(-3001)!;
console.log("identity", first === errors.get(-3001), first === fresh.get(-3001));
first[0] = "changed";
console.log("mutation", errors.get(-3001)![0], fresh.get(-3001)![0], getSystemErrorName(-3001));
errors.set(-123456, ["CUSTOM", "custom message"]);
errors.delete(-3001);
console.log("independent", errors.has(-123456), fresh.has(-123456), errors.has(-3001), fresh.has(-3001));
errors.clear();
console.log("clear", errors.size, fresh.size);

const name = getSystemErrorName;
const message = util.getSystemErrorMessage;
const all = util.getSystemErrorMap;
console.log("stored", name(-3001), message(-3001), all().get(-3001)![0]);
for (const code of [-123456, -2147483648, -2147483649, -4294967298, -9007199254740991]) {
  console.log("unknown", code, name(code), message(code));
}
