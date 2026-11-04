const fs = require("node:fs");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
async function main() {
  const root = fs.mkdtempSync(join(require("node:os").tmpdir(), "scriptc-statfs-callback-"));
  try {
    let returned = false;
    await new Promise((resolve, reject) => {
      const result = fs.statfs(pathToFileURL(root), (err, stats) => {
        if (err) reject(err); else { console.log("default", returned, typeof stats.bsize, stats.blocks > 0); resolve(undefined); }
      });
      console.log("return", result);
      returned = true;
    });
    const stored = fs.statfs;
    await new Promise((resolve, reject) => stored(Buffer.from(root), { bigint: true }, (err, stats) => {
      if (err) reject(err); else { console.log("captured", err, typeof stats.bsize, stats.blocks * stats.bsize > 0n); resolve(undefined); }
    }));
    returned = false;
    const missing = join(root, "absent", "nested");
    await new Promise(resolve => {
      fs.statfs(missing, (...args) => {
        const err = args[0], stats = args[1];
        console.log("error", returned, args.length, stats, err.name, err.code, err.message.includes("statfs"), err.message.includes(missing));
        resolve(undefined);
      });
      returned = true;
    });
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
main();
