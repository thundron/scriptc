// Validation order and error shapes are observable before filesystem syscalls.
const fs = require("node:fs");
const report = (label, action) => {
  try { action(); console.log(label, "unexpected success"); }
  catch (e) { console.log(label, e.name, e.code, e.message); }
};
report("path first", () => fs.utimesSync(null, false, false));
report("access", () => fs.utimesSync("missing", false, 1));
report("modified", () => fs.lutimesSync("missing", 1, "invalid"));
report("missing times", () => fs.utimesSync("missing"));
report("fd times first", () => fs.futimesSync(-1, NaN, false));
report("fd modified", () => fs.futimesSync(-1, 1, Infinity));
report("negative fd", () => fs.futimesSync(-1, 1, 2));
report("fraction fd", () => fs.futimesSync(0.5, 1, 2));
report("nan fd", () => fs.futimesSync(NaN, 1, 2));
report("infinite fd", () => fs.futimesSync(Infinity, 1, 2));
report("string fd", () => fs.futimesSync("1", 1, 2));
report("large fd", () => fs.futimesSync(2147483648, 1, 2));
report("null path", () => fs.utimesSync("a\0b", 1, 2));
report("null bytes", () => fs.lutimesSync(Buffer.from("a\0b"), 1, 2));
report("scheme", () => fs.utimesSync(new URL("https://example.com/x"), 1, 2));
report("encoded slash", () => fs.lutimesSync(new URL("file:///tmp/a%2Fb"), 1, 2));
report("callback first", () => fs.utimes(null, false, false, null));
report("callback path", () => fs.lutimes(null, false, false, () => {}));
report("callback time", () => fs.utimes("missing", false, 1, () => {}));
report("descriptor time first", () => fs.futimes(-1, NaN, 1, null));
report("descriptor callback", () => fs.futimes(-1, 1, 2, null));
report("descriptor range", () => fs.futimes(-1, 1, 2, () => {}));
report("missing callback", () => fs.utimes("missing", 1, 2));
report("misplaced callback", () => fs.lutimes("missing", 1, () => {}));
report("misplaced descriptor callback", () => fs.futimes(0, 1, () => {}));
report("missing all", () => fs.utimes());
