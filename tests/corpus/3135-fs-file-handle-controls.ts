// FileHandle vector results retain the array and controls share close state.
import * as fs from "node:fs";
import { open } from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
const scratch = path.join(os.tmpdir(), `scr-3135-${process.pid}`);
async function main(): Promise<void> {
  const handle = await open(scratch, "w+");
  try {
    const buffers = [Buffer.from("hello"), Buffer.from(" world")];
    const result = await handle.writev(buffers);
    console.log("writev:", result.bytesWritten, result.buffers === buffers, result.buffers[0] === buffers[0]);
    const target = [Buffer.alloc(3, 46), Buffer.alloc(10, 46)];
    const read = await handle.readv(target, 0);
    console.log("readv:", read.bytesRead, read.buffers === target, target[0]!.toString(), target[1]!.toString());
    console.log("current eof:", (await handle.readv([Buffer.alloc(1)])).bytesRead);
    console.log("empty write:", (await handle.writev([])).bytesWritten);
    await handle.sync();
    await handle.datasync();
    if (process.platform !== "win32") await handle.chmod(0o600);
    await handle.truncate(5);
    console.log("truncate:", (await handle.stat()).size);
    await handle.truncate(8);
    const tail = Buffer.alloc(3);
    console.log("extend:", (await handle.read(tail, 0, 3, 5)).bytesRead, tail.toString("hex"));
    try { await handle.truncate(0.5); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("length error:", err.name, err.code, err.message); }
    await handle.truncate();
    console.log("default truncate:", (await handle.stat()).size);
  } finally { await handle.close(); fs.unlinkSync(scratch); }
  await handle.close();
  try { await handle.sync(); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("closed sync:", err.name, err.code, err.message); }
  try { await handle.datasync(); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("closed datasync:", err.name, err.code, err.message); }
  try { await handle.truncate(); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("closed truncate:", err.name, err.code, err.message); }
  try { await handle.readv([]); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("closed readv:", err.name, err.code, err.message); }
  try { await handle.writev([]); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("closed writev:", err.name, err.code, err.message); }
}
main();
