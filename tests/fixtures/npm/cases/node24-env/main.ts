// @dynamic
// @stderr
import { reportEnv, readEnv, writeEnv } from "node24-env-fixture/env.js";
reportEnv();
process.env.SCRIPTC_ENV_BOUNDARY = "static";
console.log("to-island", JSON.stringify(readEnv("SCRIPTC_ENV_BOUNDARY")));
writeEnv("SCRIPTC_ENV_BOUNDARY", "dynamic");
console.log("to-native", process.env.SCRIPTC_ENV_BOUNDARY);
delete process.env.SCRIPTC_ENV_BOUNDARY;
console.log("deleted", readEnv("SCRIPTC_ENV_BOUNDARY") === undefined);
