// Direct and captured callbacks validate synchronously and complete later.
const fs = require("node:fs");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const root = fs.mkdtempSync(join(require("node:os").tmpdir(), "scriptc-cb-links-"));
const call = (fn, ...args) => new Promise((resolve, reject) => fn(...args, (err, result) => err ? reject(err) : resolve(result)));
async function main() {
  const file = join(root, "file");
  fs.writeFileSync(file, "shared");
  fs.mkdirSync(join(root, "dir"));
  try {
    let immediate = true;
    await new Promise((resolve, reject) => {
      fs.link(Buffer.from(file), pathToFileURL(join(root, "hard")), err => {
        console.log("deferred", immediate, err === null);
        if (err) reject(err); else resolve(undefined);
      }, "ignored");
      immediate = false;
    });
    await call(fs.link, pathToFileURL(file), Buffer.from(join(root, "stored-hard")));
    console.log("hard", fs.readFileSync(join(root, "stored-hard"), "utf8"));
    await call(fs.symlink, "dir", pathToFileURL(join(root, "junction")), "junction");
    const target = await call(fs.readlink, Buffer.from(join(root, "junction")));
    const bytes = await call(fs.readlink, pathToFileURL(join(root, "junction")), { encoding: "buffer" });
    console.log("stored readlink", typeof target, Buffer.isBuffer(bytes), bytes.toString("utf8") === target);
    await new Promise((resolve, reject) => fs.readlink(join(root, "junction"), "hex", (err, value) => {
      if (err) reject(err); else { console.log("hex", value === bytes.toString("hex")); resolve(undefined); }
    }, "ignored"));
    // String and URL paths participate in Windows's directory inference.
    try {
      await call(fs.symlink, "dir", join(root, "inferred-string"));
      console.log("inferred string", fs.statSync(join(root, "inferred-string")).isDirectory());
      await call(fs.symlink, "dir", pathToFileURL(join(root, "inferred-url")), null);
      console.log("inferred URL", fs.statSync(join(root, "inferred-url")).isDirectory());
      await call(fs.symlink, Buffer.from("file"), join(root, "buffer-file"));
      console.log("buffer file", fs.statSync(join(root, "buffer-file")).isFile());
    } catch (e) { if (process.platform === "win32" && e.code === "EPERM") console.log("inference privilege boundary"); else throw e; }
    // Buffer paths bypass that probe and use the file-link fallback.
    try {
      await call(fs.symlink, "dir", Buffer.from(join(root, "inferred")));
      console.log("inferred link", fs.lstatSync(join(root, "inferred")).isSymbolicLink());
      try { console.log("inferred stat", fs.statSync(join(root, "inferred")).isDirectory()); }
      catch (e) { console.log("inferred stat", e.name, e.code, e.message.includes("stat")); }
    } catch (e) { if (process.platform === "win32" && e.code === "EPERM") console.log("symlink privilege boundary"); else throw e; }
    let synchronous = true;
    await new Promise(resolve => {
      fs.readlink(file, (err) => { console.log("error deferred", synchronous, err.name, err.code); resolve(undefined); });
      synchronous = false;
    });
    try { await call(fs.link, file + ".missing", join(root, "missing")); } catch (e) { console.log("missing", e.name, e.code, e.message.includes(" -> ")); }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
main();
