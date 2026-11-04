import { writeFileSync, unlinkSync, mkdtempSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { loadEnvFile } from "node:process";
import { pathToFileURL } from "node:url";

const directory = mkdtempSync(tmpdir() + "/scriptc-node24-env-");
const previous = process.cwd();
process.chdir(directory);
delete process.env.SCRIPTC_ENV_NEW;
delete process.env.SCRIPTC_ENV_SECOND;
process.env.SCRIPTC_ENV_KEEP = "existing";
process.env.SCRIPTC_ENV_EMPTY = "";
writeFileSync(".env", "SCRIPTC_ENV_NEW=default\nSCRIPTC_ENV_KEEP=replaced\nSCRIPTC_ENV_EMPTY=replaced\n", "utf8");
writeFileSync("another.env", "SCRIPTC_ENV_NEW=another\nSCRIPTC_ENV_SECOND=\"two\\nlines\"\n", "utf8");
try {
  loadEnvFile();
  console.log(process.env.SCRIPTC_ENV_NEW, process.env.SCRIPTC_ENV_KEEP, JSON.stringify(process.env.SCRIPTC_ENV_EMPTY));
  loadEnvFile("another.env");
  console.log(process.env.SCRIPTC_ENV_NEW, JSON.stringify(process.env.SCRIPTC_ENV_SECOND));
  delete process.env.SCRIPTC_ENV_NEW;
  loadEnvFile(Buffer.from(".env"));
  console.log("buffer", process.env.SCRIPTC_ENV_NEW);
  delete process.env.SCRIPTC_ENV_NEW;
  loadEnvFile(pathToFileURL(process.cwd() + "/.env"));
  console.log("url", process.env.SCRIPTC_ENV_NEW);
  delete process.env.SCRIPTC_ENV_NEW;
  loadEnvFile(undefined);
  console.log("undefined", process.env.SCRIPTC_ENV_NEW);
  delete process.env.SCRIPTC_ENV_NEW;
  loadEnvFile(null as unknown as string);
  console.log("null", process.env.SCRIPTC_ENV_NEW);
  writeFileSync("raw.env", Buffer.from([83, 67, 82, 73, 80, 84, 67, 95, 69, 78, 86, 95, 82, 65, 87, 61, 255, 226, 130]));
  delete process.env.SCRIPTC_ENV_RAW;
  loadEnvFile("raw.env");
  console.log("raw", JSON.stringify(process.env.SCRIPTC_ENV_RAW));
  unlinkSync("raw.env");
} finally {
  unlinkSync(".env");
  unlinkSync("another.env");
  process.chdir(previous);
  rmdirSync(directory);
}
