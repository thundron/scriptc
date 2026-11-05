// fs/promises async members behind settled promises: realpath (symlink
// resolution), lstat (no-follow snapshot), access (F_OK / mode), and
// mkdtemp (prefix + 6 chars). Failures REJECT with Node's errno code,
// catchable at the await. Output is deterministic (no random names or
// timing printed). symlinkSync has no lowering, so Node makes the link.
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { realpath, lstat, access, mkdtemp } from "node:fs/promises";
import { join, basename } from "node:path";
import { tmpdir } from "node:os";

const dir = mkdtempSync(join(tmpdir(), "scr-fsp-"));
const file = join(dir, "f.txt");
const link = join(dir, "link");
writeFileSync(file, "hi");
execFileSync(
  "node",
  ["-e", "require('node:fs').symlinkSync(process.argv[1],process.argv[2])", file, link],
  { stdio: "pipe" },
);

async function main(): Promise<void> {
  // realpath resolves the symlink to the real file.
  const rp = await realpath(link);
  console.log("realpath:", basename(rp), rp === file);

  // lstat does NOT follow: the link is a symlink, the file is a file.
  const ls = await lstat(link);
  console.log("lstat link:", ls.isSymbolicLink(), ls.isFile());
  const lf = await lstat(file);
  console.log("lstat file:", lf.isFile(), lf.isSymbolicLink(), lf.size === 2);

  // access: default F_OK and explicit R_OK both resolve for a readable file.
  await access(file);
  await access(file, 4);
  console.log("access resolved");

  // mkdtemp: the prefix plus six random characters.
  const tmp = await mkdtemp(join(dir, "sub-"));
  console.log("mkdtemp:", basename(tmp).startsWith("sub-"), basename(tmp).length === "sub-".length + 6);

  // Rejections carry Node's errno code, thrown at the await.
  try {
    await realpath(join(dir, "nope"));
  } catch (e) {
    console.log("realpath missing:", (e as NodeJS.ErrnoException).code);
  }
  try {
    await lstat(join(dir, "nope"));
  } catch (e) {
    console.log("lstat missing:", (e as NodeJS.ErrnoException).code);
  }
  try {
    await access(join(dir, "nope"));
  } catch (e) {
    console.log("access missing:", (e as NodeJS.ErrnoException).code);
  }

  // Clean up after every await settles (inside main so the ordering is the
  // same under Node's deferred microtasks and scriptc's inline settling).
  rmSync(dir, { recursive: true, force: true });
}

main();
