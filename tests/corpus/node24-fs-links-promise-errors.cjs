// Promise validation rejects, including options-first and oldPath naming.
const fsp = require("node:fs/promises");
const report = async (label, action) => {
  let promise;
  try { promise = action(); console.log(label, "returned promise"); }
  catch (e) { console.log(label, "synchronous throw", e.name); return; }
  try { await promise; console.log(label, "unexpected success"); }
  catch (e) { console.log(label, e.name, e.code, e.message); }
};
async function main() {
  await report("type", () => fsp.symlink(null, null, "other"));
  await report("target", () => fsp.symlink(null, null));
  await report("destination", () => fsp.symlink("target", null));
  await report("source", () => fsp.link(null, null));
  await report("new path", () => fsp.link("existing", null));
  await report("options", () => fsp.readlink(null, 1));
  await report("encoding", () => fsp.readlink(null, "invalid"));
  await report("old path", () => fsp.readlink(null));
  await report("signal", () => fsp.readlink(null, { signal: 1 }));
  // Captured functions preserve promise rejection behavior too.
  const stored = fsp.link;
  await report("stored", () => stored("existing", null));
}
main();
