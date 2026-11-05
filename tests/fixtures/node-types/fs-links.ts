import { symlinkSync, readlinkSync, linkSync, symlink, readlink, mkdirSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { symlink as symlinkPromise, readlink as readlinkPromise, link as linkPromise } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
async function main(): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), "scriptc-typed-links-"));
  const file = join(root, "file");
  writeFileSync(file, "typed");
  mkdirSync(join(root, "dir"));
  try {
    linkSync(pathToFileURL(file), Buffer.from(join(root, "hard")));
    await linkPromise(Buffer.from(file), pathToFileURL(join(root, "promise-hard")));
    console.log("hard", readFileSync(join(root, "promise-hard"), "utf8"));
    const path = join(root, "junction");
    symlinkSync("dir", pathToFileURL(path), "junction");
    const text: string = readlinkSync(Buffer.from(path));
    const bytes: Buffer = readlinkSync(pathToFileURL(path), { encoding: "buffer" });
    console.log("sync", text === bytes.toString());
    await symlinkPromise(Buffer.from("dir"), pathToFileURL(join(root, "promise")), "junction");
    const promised: Buffer = await readlinkPromise(join(root, "promise"), "buffer");
    console.log("promise", await readlinkPromise(join(root, "promise")) === promised.toString());
    await new Promise<void>((resolve, reject) => symlink("dir", join(root, "callback"), "junction", err => err ? reject(err) : resolve()));
    await new Promise<void>((resolve, reject) => readlink(join(root, "callback"), "buffer", (err, target) => {
      if (err) reject(err); else { console.log("callback", target.toString() === text); resolve(); }
    }));
  } finally { rmSync(root, { recursive: true, force: true }); }
}
main();
