// Runtime encodings, falsy defaults, and valid aborted signals retain readlink semantics.
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const { join } = require("node:path");
const root = fs.mkdtempSync(join(require("node:os").tmpdir(), "scriptc-link-options-"));
async function main() {
  fs.mkdirSync(join(root, "dir"));
  const path = join(root, "link");
  try {
    const create = fs.symlinkSync;
    create("dir", path, "junction");
    const read = fs.readlinkSync;
    const expected = read(path);
    for (const options of [null, undefined, "", {}, [], { encoding: null }, { encoding: false }, { encoding: 0 }]) {
      console.log("default", fs.readlinkSync(path, options) === expected);
    }
    for (const encoding of ["utf8", "hex", "base64", "base64url", "latin1", "ascii", "utf16le", "buffer"]) {
      const result = fs.readlinkSync(path, { encoding });
      const raw = fs.readlinkSync(path, "buffer");
      console.log(encoding, encoding === "buffer" ? Buffer.isBuffer(result) && result.toString("hex") === raw.toString("hex") : result === raw.toString(encoding));
    }
    const controller = new AbortController();
    controller.abort();
    const options = { signal: controller.signal, encoding: "utf8" };
    console.log("signal sync", fs.readlinkSync(path, options) === expected);
    console.log("signal promise", await fsp.readlink(path, options) === expected);
    await new Promise((resolve, reject) => fs.readlink(path, options, (err, target) => {
      if (err) reject(err); else { console.log("signal callback", target === expected); resolve(undefined); }
    }));
    const storedPromise = fsp.readlink;
    console.log("stored promise", await storedPromise(path) === expected);
    const storedCreate = fsp.symlink;
    await storedCreate("dir", join(root, "stored"), "junction");
    console.log("stored create", fs.statSync(join(root, "stored")).isDirectory());
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
main();
