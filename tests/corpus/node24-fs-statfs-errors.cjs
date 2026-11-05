const fs = require("node:fs");
const fsp = require("node:fs/promises");
const { join } = require("node:path");
const root = fs.mkdtempSync(join(require("node:os").tmpdir(), "scriptc-statfs-errors-"));
const report = (label, action) => {
  try { action(); console.log(label, "unexpected success"); }
  catch (e) { console.log(label, e.name, e.code, e.message); }
};
async function reportPromise(label, path, options) {
  let returned = false;
  const promise = fsp.statfs(path, options);
  returned = true;
  try { await promise; console.log("promise", label, "unexpected success"); }
  catch (e) { console.log("promise", label, returned, e.name, e.code, label === "missing" ? e.message.includes("statfs") && e.message.includes(path) : e.message); }
}
async function main() {
  try {
    report("callback first", () => fs.statfs(null, null, null));
    report("callback missing", () => fs.statfs("."));
    report("callback fixed slot", () => fs.statfs(".", {}, undefined, () => {}));
    report("sync path first", () => fs.statfsSync(null, null));
    report("callback path first", () => fs.statfs(null, null, () => {}));
    report("sync null options", () => fs.statfsSync(".", null));
    report("callback null options", () => fs.statfs(".", null, () => {}));
    report("number path", () => fs.statfsSync(42));
    report("nul string", () => fs.statfsSync("a\0b"));
    report("nul buffer", () => fs.statfsSync(Buffer.from("a\0b")));
    report("scheme", () => fs.statfsSync(new URL("https://example.com/a")));
    report("encoded slash", () => fs.statfsSync(new URL("file:///tmp/a%2Fb")));
    const missing = join(root, "missing", "nested");
    try { fs.statfsSync(missing); } catch (e) {
      console.log("sync missing", e.name, e.code, e.message.includes("statfs"), e.message.includes(missing));
    }
    const getter = { get bigint() { throw new RangeError("option getter"); } };
    report("sync getter", () => fs.statfsSync(".", getter));
    report("callback getter", () => fs.statfs(".", getter, () => {}));
    let reads = 0;
    report("second callback getter", () => fs.statfs(".", { get bigint() { if (++reads === 2) throw new Error("second read"); return true; } }, () => {}));
    await reportPromise("path", null, null);
    await reportPromise("options", ".", null);
    await reportPromise("nul", "a\0b", {});
    await reportPromise("getter", ".", getter);
    await reportPromise("missing", missing, {});
    fs.writeFileSync(join(root, "file"), "contents");
    try { fs.statfsSync(join(root, "file", "child")); } catch (e) { console.log("file child", e.name, e.code); }
    // Windows retries the parent of a missing final component; POSIX checks it.
    try { console.log("missing final", fs.statfsSync(join(root, "absent")).bsize > 0); }
    catch (e) { console.log("missing final", e.name, e.code); }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
main();
