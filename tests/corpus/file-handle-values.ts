import { open, unlink } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
const path = `/tmp/scriptc-file-handle-values-${process.pid}.txt`;
const handle = await open(path, "w+", 0o600);
try {
  const stored: unknown = handle;
  const alias: FileHandle = stored as FileHandle;
  console.log(handle === alias, alias.fd === handle.fd);
  await alias.writeFile("native", "utf8");
  console.log((await handle.stat()).size);
  await alias.close();
  console.log(handle.fd, alias.fd);
  await handle.close();
} finally {
  await unlink(path);
}
