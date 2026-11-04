// lutimes updates the link itself; utimes follows it to the target.
import * as fs from "node:fs";
import { execFileSync } from "node:child_process";
import { lutimes, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
async function main(): Promise<void> {
  if (process.platform === "win32") { console.log("symlink privilege boundary"); return; }
  const file = join(tmpdir(), `scriptc-link-times-${process.pid}`);
  const link = file + ".link";
  fs.writeFileSync(file, "timestamps");
  execFileSync("node", ["-e", "require('node:fs').symlinkSync(process.argv[1], process.argv[2])", file, link]);
  try {
    fs.utimesSync(file, 946684800, 946684801);
    fs.lutimesSync(link, 946684802, new Date(946684803000));
    console.log("sync link", fs.lstatSync(link).atimeMs, fs.lstatSync(link).mtimeMs, fs.statSync(file).mtimeMs);
    await lutimes(link, "946684804", 946684805);
    console.log("promise link", fs.lstatSync(link).mtimeMs, fs.statSync(file).mtimeMs);
    await utimes(link, 946684806, 946684807);
    console.log("follow", fs.statSync(file).mtimeMs, fs.lstatSync(link).mtimeMs);
    await new Promise<void>((resolve, reject) => fs.lutimes(link, 946684808, 946684809, err => err ? reject(err) : resolve()));
    console.log("callback link", fs.lstatSync(link).mtimeMs, fs.statSync(file).mtimeMs);
    fs.unlinkSync(file);
    fs.lutimesSync(link, 946684810, 946684811);
    console.log("dangling link", fs.lstatSync(link).mtimeMs);
    try { await utimes(link, 1, 2); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("dangling follow", err.name, err.code); }
  } finally { fs.unlinkSync(link); if (fs.existsSync(file)) fs.unlinkSync(file); }
}
main();
