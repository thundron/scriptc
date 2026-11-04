import { futimesSync, lutimes, utimesSync, writeFileSync, unlinkSync, statSync } from "node:fs";
import { lutimes as promiseLutimes, open, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

async function main(): Promise<void> {
  const file = join(tmpdir(), `scriptc-types-times-${process.pid}`);
  writeFileSync(file, "timestamps");
  const handle = await open(file, "r+");
  try {
    const timestamp = new Date(946684800000);
    utimesSync(pathToFileURL(file), timestamp, "946684801");
    futimesSync(handle.fd, "946684802", timestamp);
    await utimes(Buffer.from(file), timestamp, 946684803);
    await promiseLutimes(pathToFileURL(file), 946684804, timestamp);
    await handle.utimes(timestamp, "946684805");
    await new Promise<void>((resolve, reject) => lutimes(file, timestamp, "946684806", err => err ? reject(err) : resolve()));
    console.log(statSync(file).atimeMs, statSync(file).mtimeMs);
  } finally { await handle.close(); unlinkSync(file); }
}
main();
