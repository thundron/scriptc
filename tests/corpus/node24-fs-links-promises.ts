// Promise adapters fulfill typed string/Buffer results and reject argument errors.
import * as fs from "node:fs";
import { link, symlink, readlink } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
async function main(): Promise<void> {
  const root = fs.mkdtempSync(join(tmpdir(), "scriptc-promise-links-"));
  const file = join(root, "file");
  fs.writeFileSync(file, "contents");
  fs.mkdirSync(join(root, "directory"));
  try {
    await link(Buffer.from(file), pathToFileURL(join(root, "hard")));
    console.log("link fulfilled");
    console.log("hard", fs.readFileSync(join(root, "hard"), "utf8"));
    await symlink(Buffer.from("directory"), pathToFileURL(join(root, "junction")), "junction");
    console.log("symlink fulfilled");
    const target = await readlink(pathToFileURL(join(root, "junction")));
    const bytes = await readlink(Buffer.from(join(root, "junction")), "buffer");
    console.log("readlink", target === (process.platform === "win32" ? join(root, "directory") : "directory"), bytes.toString("utf8") === target);
    console.log("hex", await readlink(join(root, "junction"), { encoding: "hex" }) === bytes.toString("hex"));
    try { await link(file, join(root, "hard")); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("existing", err.name, err.code); }
    try { await readlink(file); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("regular", err.name, err.code); }
    try { await symlink("directory", join(root, "junction"), "junction"); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("symlink existing", err.name, err.code); }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
main();
