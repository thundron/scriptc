// Timestamp inputs retain Node's seconds, Date, and current/unchanged semantics.
import { closeSync, fstatSync, futimesSync, lutimesSync, openSync, statSync, unlinkSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const file = join(tmpdir(), `scriptc-times-${process.pid}.txt`);
writeFileSync(file, "timestamps");
const fd = openSync(file, "r+");
function show(label: string): void {
  const stat = statSync(file);
  console.log(label, stat.atimeMs, stat.mtimeMs);
}
function time(numeric: boolean): number | string {
  return numeric ? 946684802.25 : "946684803.5";
}
try {
  utimesSync(file, 946684800.125, "946684801.75");
  show("seconds");
  futimesSync(fd, new Date(946684802250), new Date(946684803500));
  console.log("descriptor", fstatSync(fd).atimeMs, fstatSync(fd).mtimeMs);
  utimesSync(Buffer.from(file), time(true), time(false));
  show("buffer and union");
  lutimesSync(pathToFileURL(file), "0x10", "  ");
  show("URL and strings");
  utimesSync(file, new Date(NaN), new Date(946684804000));
  show("unchanged access");
  futimesSync(fd, 946684805, new Date(NaN));
  show("unchanged modified");
  const before = Date.now() - 2000;
  utimesSync(file, -1, "Infinity");
  const current = statSync(file);
  // UTIME_NOW can preserve submillisecond precision; Date.now is integral.
  console.log("current", current.atimeMs >= before && current.atimeMs <= Date.now() + 1, current.mtimeMs >= before && current.mtimeMs <= Date.now() + 1);
  utimesSync(file, "-Infinity", new Date(NaN));
  console.log("negative infinity", statSync(file).atimeMs >= before);
  let order = "";
  const input = (): string => { order += "p"; return file; };
  const access = (): Date => { order += "a"; return new Date(946684806000); };
  const modified = (): number => { order += "m"; return 946684807; };
  utimesSync(input(), access(), modified());
  console.log("evaluation", order);
  show("evaluated times");
  if (process.platform !== "win32") {
    utimesSync(file, "-1.25", new Date(-2500));
    show("pre-epoch");
    utimesSync(file, 1000.123456789, 1001.987654321);
    const precise = statSync(file);
    console.log("microseconds", Math.round(precise.atimeMs * 1000), Math.round(precise.mtimeMs * 1000));
  }
} finally { closeSync(fd); unlinkSync(file); }
