// Promise and FileHandle timestamp operations reject without synchronous throws.
import { statSync, unlinkSync, writeFileSync } from "node:fs";
import { lutimes, open, utimes } from "node:fs/promises";
import * as promises from "fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const file = join(tmpdir(), `scriptc-promise-times-${process.pid}.txt`);
async function main(): Promise<void> {
  writeFileSync(file, "timestamps");
  const handle = await open(file, "r+");
  try {
    await utimes(pathToFileURL(file), new Date(946684800000), "946684801.5");
    console.log("path", statSync(file).atimeMs, statSync(file).mtimeMs);
    await lutimes(Buffer.from(file), 946684802, new Date(946684803000));
    await handle.utimes("946684804.25", new Date(946684805750));
    const info = await handle.stat();
    console.log("handle", info.atimeMs, info.mtimeMs);
    await promises.utimes(file, 946684806, 946684807);
    console.log("alias", statSync(file).mtimeMs);
    try { await handle.utimes(NaN, 1); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("access error", err.name, err.code, err.message); }
    try { await handle.utimes(1, Infinity); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("modified error", err.name, err.code, err.message); }
    let sync = true;
    const rejected = utimes(file, NaN, 1);
    sync = false;
    try { await rejected; } catch (e) { const err = e as NodeJS.ErrnoException; console.log("rejected", sync, err.name, err.code, err.message); }
    try { await lutimes(file + ".missing", 1, 2); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("missing", err.name, err.code, err.message.includes("lutime")); }
  } finally { await handle.close(); unlinkSync(file); }
  try { await handle.utimes(NaN, Infinity); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("closed before inputs", err.name, err.code, err.message); }
}
main();
