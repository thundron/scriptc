import processDefault, { loadEnvFile } from "node:process";
import { parseEnv } from "node:util";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

const parsed = parseEnv("Z=last\nA=first\nMULTI=\"two\\nlines\"\n");
console.log(JSON.stringify(parsed), parsed.A, parsed.MISSING === undefined);
const directory = mkdtempSync(tmpdir() + "/scriptc-node-types-env-");
const path = directory + "/values.env";
processDefault.env.SCRIPTC_ENV_TYPES_KEEP = "existing";
delete processDefault.env.SCRIPTC_ENV_TYPES_NEW;
try {
  writeFileSync(path, "SCRIPTC_ENV_TYPES_NEW=loaded\nSCRIPTC_ENV_TYPES_KEEP=replaced\n");
  loadEnvFile(pathToFileURL(path));
  console.log(processDefault.env.SCRIPTC_ENV_TYPES_NEW, processDefault.env.SCRIPTC_ENV_TYPES_KEEP);
  delete processDefault.env.SCRIPTC_ENV_TYPES_NEW;
  processDefault.loadEnvFile(Buffer.from(path));
  console.log(processDefault.env.SCRIPTC_ENV_TYPES_NEW);
} finally {
  rmSync(directory, { recursive: true, force: true });
}
