// Relative targets stay relative to the link's parent; hard links share contents.
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const root = fs.mkdtempSync(join(tmpdir(), "scriptc-links-"));
const outside = fs.mkdtempSync(join(tmpdir(), "scriptc-link-target-"));
fs.writeFileSync(join(outside, "keep"), "preserved");
const file = join(root, "target.txt");
const hard = join(root, "hard.txt");
const nested = join(root, "nested");
fs.writeFileSync(file, "first");
fs.mkdirSync(nested);
try {
  fs.linkSync(pathToFileURL(file), Buffer.from(hard));
  const storedLink = fs.linkSync;
  storedLink(Buffer.from(file), join(root, "stored-hard"));
  fs.writeFileSync(hard, "shared");
  console.log("hard", fs.readFileSync(file, "utf8"), fs.statSync(file).ino === fs.statSync(hard).ino);
  try { fs.linkSync(file, hard); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("existing", err.name, err.code, err.message.includes("link")); }
  try { fs.linkSync(file + ".missing", hard + ".missing"); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("missing", err.name, err.code, err.message.includes(" -> ")); }
  const relative = join(nested, "relative");
  let canSymlink = true;
  try { fs.symlinkSync("../target.txt", relative); }
  catch (e) { const err = e as NodeJS.ErrnoException; if (process.platform === "win32" && err.code === "EPERM") { canSymlink = false; console.log("symlink privilege boundary"); } else throw e; }
  if (canSymlink) {
    const text = fs.readlinkSync(pathToFileURL(relative));
    const bytes = fs.readlinkSync(Buffer.from(relative), { encoding: "buffer" });
    console.log("relative", text === (process.platform === "win32" ? "..\\target.txt" : "../target.txt"), fs.readFileSync(relative, "utf8"), bytes.toString("utf8") === text);
    console.log("encodings", fs.readlinkSync(relative, "hex") === bytes.toString("hex"), fs.readlinkSync(relative, { encoding: "base64" }) === bytes.toString("base64"), fs.readlinkSync(relative, "latin1") === bytes.toString("latin1"));
    fs.symlinkSync(pathToFileURL(file), join(root, "absolute"), "file");
    console.log("absolute", fs.readlinkSync(join(root, "absolute")) === file);
    fs.symlinkSync("missing-target", join(root, "dangling"), null);
    console.log("dangling", fs.readlinkSync(join(root, "dangling")), fs.lstatSync(join(root, "dangling")).isSymbolicLink());
    try { fs.statSync(join(root, "dangling")); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("dangling stat", err.name, err.code); }
    fs.symlinkSync("nested", join(root, "directory"), "dir");
    console.log("directory", fs.statSync(join(root, "directory")).isDirectory());
    fs.symlinkSync("nested", join(root, "file-directory"), "file");
    console.log("file-directory link", fs.lstatSync(join(root, "file-directory")).isSymbolicLink(), fs.readlinkSync(join(root, "file-directory")) === "nested");
    try { console.log("file-directory stat", fs.statSync(join(root, "file-directory")).isDirectory()); }
    catch (e) { const err = e as NodeJS.ErrnoException; console.log("file-directory stat", err.name, err.code); }
    fs.symlinkSync("target.txt", join(root, "directory-file"), "dir");
    console.log("directory-file link", fs.lstatSync(join(root, "directory-file")).isSymbolicLink());
    try { console.log("directory-file stat", fs.statSync(join(root, "directory-file")).isFile()); }
    catch (e) { const err = e as NodeJS.ErrnoException; console.log("directory-file stat", err.name, err.code); }
    if (process.platform !== "win32") {
      fs.symlinkSync("x".repeat(600), join(root, "long"), "file");
      console.log("long", fs.readlinkSync(join(root, "long")).length);
      fs.symlinkSync(Buffer.from([0x61, 0xff, 0x62]), Buffer.from(join(root, "raw")));
      console.log("raw", fs.readlinkSync(join(root, "raw"), "buffer").toString("hex"), fs.readlinkSync(join(root, "raw")));
    }
  }
  // Junctions do not require Windows symlink privileges. POSIX ignores type.
  fs.symlinkSync("nested", join(root, "junction"), "junction");
  console.log("junction", fs.statSync(join(root, "junction")).isDirectory(), fs.readlinkSync(join(root, "junction")) === (process.platform === "win32" ? nested : "nested"));
  fs.unlinkSync(join(root, "junction"));
  console.log("unlink directory link", fs.statSync(nested).isDirectory());
  fs.symlinkSync("nested", join(root, "remove"), "junction");
  fs.rmSync(join(root, "remove"));
  console.log("remove directory link", fs.statSync(nested).isDirectory());
  fs.symlinkSync(outside, join(root, "outside"), "junction");
  fs.unlinkSync(file);
  console.log("survives", fs.readFileSync(hard, "utf8"));
} finally {
  try {
    fs.rmSync(root, { recursive: true, force: true });
    console.log("no-follow cleanup", fs.readFileSync(join(outside, "keep"), "utf8"));
  } finally { fs.rmSync(outside, { recursive: true, force: true }); }
}
