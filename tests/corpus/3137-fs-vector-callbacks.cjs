// Native descriptor callbacks, payload identity, and synchronous validation.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const scratch = path.join(os.tmpdir(), `scr-3137-${process.pid}`);
const fd = fs.openSync(scratch, "w+");
const io = (action) => new Promise((resolve, reject) => action((err, n, buffers) => err ? reject(err) : resolve({ n, buffers })));
async function main() {
  try {
    const source = [Buffer.from("abc"), Buffer.from("def")];
    const written = await io((cb) => fs.writev(fd, source, cb));
    console.log("writev:", written.n, written.buffers === source);
    const target = [Buffer.alloc(2), Buffer.alloc(6, 46)];
    const read = await io((cb) => fs.readv(fd, target, 0, cb));
    console.log("readv:", read.n, read.buffers === target, target[0].toString(), target[1].toString());
    const empty = [];
    console.log("empty writev:", (await io((cb) => fs.writev(fd, empty, cb))).buffers === empty);
    await io((cb) => fs.fdatasync(fd, cb));
    if (process.platform !== "win32") await io((cb) => fs.fchmod(fd, 0o600, cb));
    await io((cb) => fs.ftruncate(fd, -1, cb));
    console.log("truncate clamp:", fs.fstatSync(fd).size);
    try { fs.ftruncate(fd, 0.5, () => console.log("unexpected callback")); } catch (e) { console.log("sync length:", e.name, e.code, e.message); }
    try { fs.readv(-1, target, () => console.log("unexpected callback")); } catch (e) { console.log("sync fd:", e.name, e.code, e.message); }
    try { fs.writev(fd, [1], () => console.log("unexpected callback")); } catch (e) { console.log("sync buffers:", e.name, e.code); }
    try { await io((cb) => fs.readv(fd, [], cb)); } catch (e) { console.log("empty readv:", e.name, e.code, e.message); }
  } finally { fs.closeSync(fd); fs.unlinkSync(scratch); }
  try { await io((cb) => fs.fdatasync(fd, cb)); } catch (e) { console.log("closed:", e.name, e.code, e.message); }
}
main();
