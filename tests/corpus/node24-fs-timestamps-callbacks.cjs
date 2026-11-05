// Direct and stored callbacks defer success and syscall errors, but validate now.
const fs = require("node:fs");
const { pathToFileURL } = require("node:url");
const file = require("node:path").join(require("node:os").tmpdir(), `scriptc-callback-times-${process.pid}`);
const call = (fn, ...args) => new Promise((resolve, reject) => fn(...args, (error) => error ? reject(error) : resolve(undefined)));
async function main() {
  fs.writeFileSync(file, "timestamps");
  const fd = fs.openSync(file, "r+");
  try {
    let immediate = true;
    await new Promise((resolve, reject) => {
      fs.utimes(pathToFileURL(file), new Date(946684800000), "946684801.5", (err) => {
        console.log("deferred", immediate, err === null);
        if (err) reject(err); else resolve(undefined);
      }, "ignored extra argument");
      immediate = false;
    });
    console.log("path", fs.statSync(file).atimeMs, fs.statSync(file).mtimeMs);
    await call(fs.futimes, fd, new Date(946684802000), "946684803.25");
    console.log("descriptor", fs.fstatSync(fd).atimeMs, fs.fstatSync(fd).mtimeMs);
    await call(fs.lutimes, Buffer.from(file), 946684804, new Date(946684805000));
    console.log("stored", fs.statSync(file).mtimeMs);
    let synchronous = true;
    const failure = new Promise((resolve) => {
      fs.lutimes(file + ".missing", 1, 2, (err) => {
        console.log("syscall", synchronous, err.name, err.code, err.message.includes("lutime"));
        resolve(undefined);
      });
      synchronous = false;
    });
    await failure;
  } finally { fs.closeSync(fd); fs.unlinkSync(file); }
  try { await call(fs.futimes, fd, 1, 2); } catch (e) { console.log("closed descriptor", e.name, e.code, e.message); }
}
main();
