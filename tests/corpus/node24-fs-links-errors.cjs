// Validation order is observable before any filesystem operation.
const fs = require("node:fs");
const cwd = process.cwd().replaceAll("\\", "\\\\");
const report = (label, action) => {
  try { action(); console.log(label, "unexpected success"); }
  catch (e) { console.log(label, e.name, e.code, e.message.replaceAll(cwd, "<cwd>")); }
};
// Object inspection in Received tails remains a separate runtime limitation.
const reportObjectEncoding = (label, encoding) => {
  try { fs.readlinkSync(null, { encoding }); console.log(label, "unexpected success"); }
  catch (e) { console.log(label, e.name, e.code, e.message.startsWith("The argument 'encoding' is invalid encoding. Received ")); }
};
report("symlink type first", () => fs.symlinkSync(null, null, "other"));
if (process.platform === "win32") report("junction buffer destination", () => fs.symlinkSync("target", Buffer.from("link"), "junction"));
report("numeric type", () => fs.symlinkSync(null, null, 1));
report("symlink target", () => fs.symlinkSync(null, null));
report("symlink path", () => fs.symlinkSync("target", null, "file"));
report("nul target", () => fs.symlinkSync("a\0b", "link"));
report("nul buffer target", () => fs.symlinkSync(Buffer.from("a\0b"), "link"));
report("hard source", () => fs.linkSync(null, null));
report("hard destination", () => fs.linkSync("existing", null));
report("nul source", () => fs.linkSync("a\0b", "new"));
report("nul destination", () => fs.linkSync("existing", Buffer.from("a\0b")));
report("scheme", () => fs.symlinkSync(new URL("https://example.com/target"), "link"));
report("encoded slash", () => fs.linkSync(new URL("file:///tmp/a%2Fb"), "new"));
report("readlink options first", () => fs.readlinkSync(null, 1));
report("readlink encoding first", () => fs.readlinkSync(null, "invalid"));
report("readlink numeric encoding", () => fs.readlinkSync(null, { encoding: 1 }));
reportObjectEncoding("readlink object encoding", {});
reportObjectEncoding("readlink nested encoding", { encoding: "hex" });
report("readlink signal", () => fs.readlinkSync(null, { signal: null }));
report("readlink path", () => fs.readlinkSync(null, { encoding: "buffer" }));
report("readlink nul", () => fs.readlinkSync(Buffer.from("a\0b")));
report("link callback first", () => fs.link(null, null, null));
report("link fixed callback", () => fs.link("existing", "new"));
report("symlink omitted callback", () => fs.symlink(null, null));
report("symlink bad callback", () => fs.symlink(null, null, null));
report("symlink callback type first", () => fs.symlink(null, null, "other", () => {}));
report("symlink callback target", () => fs.symlink(null, null, () => {}));
report("readlink callback first", () => fs.readlink(null, 1, null));
report("readlink callback options", () => fs.readlink(null, 1, () => {}));
report("readlink callback encoding", () => fs.readlink(null, "invalid", () => {}));
report("readlink callback path", () => fs.readlink(null, () => {}));
