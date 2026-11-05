import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync as realpath, rmSync, writeFileSync } from "node:fs";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "scr-native-realpath-"));
const target = join(dir, "target");
const link = join(dir, "link");
mkdirSync(target);
writeFileSync(join(target, "file.txt"), "content");
execFileSync("node", ["-e", "require('node:fs').symlinkSync(process.argv[1], process.argv[2], process.platform === 'win32' ? 'junction' : 'dir')", target, link], { stdio: "pipe" });
try {
  console.log("cwd", realpath.native(".") === realpath("."));
  console.log("file", realpath.native(join(target, "file.txt")) === realpath(join(target, "file.txt")));
  console.log("link", realpath.native(link) === realpath.native(target));
  console.log("namespace", fs.realpathSync.native(join(link, "file.txt")) === realpath.native(join(target, "file.txt")));
  console.log("parent", realpath.native(join(target, "..")) === realpath.native(dir));
  for (const path of [join(dir, "missing"), join(dir, "missing", "child")]) {
    try { realpath.native(path); }
    catch (error) {
      const e = error as NodeJS.ErrnoException;
      console.log("error", e instanceof Error, e.code, e.message.includes("realpath"), e.message.includes(path));
    }
  }
  function shadow(realpathSync: { native: (path: string) => string }): void {
    console.log(realpathSync.native("fake"));
  }
  shadow({ native: (path) => "local:" + path });
} finally {
  rmSync(dir, { recursive: true, force: true });
}
