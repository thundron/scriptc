import { open, rename, unlink } from "node:fs/promises";
import { writeFileSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import * as path from "node:path";

class Files {
  static system = { open, rename, unlink };
}
const names = { join, basename };
console.log(typeof Files.system.open, typeof Files.system.rename, typeof Files.system.unlink);
console.log(names.join("a", "b", "c"), names.join(), names.basename("/a/b.ts", undefined));
console.log(names.join === path.join);
const file = `/tmp/scriptc-stored-builtins-${process.pid}.txt`;
writeFileSync(file, "hello");
try {
  const handle = await Files.system.open(file, undefined, undefined);
  const alias = handle;
  console.log(handle === alias, await handle.readFile("utf8"));
  await alias.close();
  console.log(handle.fd);
  await Files.system.rename(file, file + ".moved");
  await Files.system.unlink(file + ".moved");
  const created = await Files.system.open(file, "wx", 0o600);
  console.log(statSync(file).isFile());
  await created.close();
  try { await Files.system.open(file + ".missing"); }
  catch (error) { console.log(error.code); }
} finally {
  await Files.system.unlink(file);
}
