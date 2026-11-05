// The Buffer forms of fs: readFileSync(path) with no encoding → Buffer,
// writeFileSync(path, buffer) byte-exact (a NUL and non-utf8 sequences
// survive), and THE chain real code uses: new Uint8Array(await readFile(p)).
import { appendFileSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

function tail(path: string): string {
  let i = path.length - 1;
  while (i >= 0 && path.charAt(i) !== "/" && path.charAt(i) !== "\\") {
    i = i - 1;
  }
  return path.slice(i + 1);
}
// The pid keeps the scratch name unique: the C and LLVM differential
// harnesses run this program CONCURRENTLY, and both cache binaries are
// named "program", so an argv-derived name alone collides across them
// (the 1640 precedent).
const path = "tmp-1403-" + tail(process.argv[1]) + "-" + process.pid + ".bin";

const blob = Buffer.from("00ff80eda0bd0a", "hex");
writeFileSync(path, blob);
const back = readFileSync(path);
console.log("rt", back.length, back.toString("hex"));
console.log("elem", back[0], back[1]);

// Uint8Array data writes too (u8 is u8).
writeFileSync(path, new Uint8Array([1, 0, 2]));
console.log("u8", readFileSync(path).toString("hex"));

async function viaPromises(): Promise<void> {
  const buf = await readFile(path);
  console.log("fsp", buf.toString("hex"));
  const arr = new Uint8Array(await readFile(path));
  console.log("chain", arr.length, arr[0], arr[1], arr[2]);
}
async function main(): Promise<void> {
  await viaPromises();
  // Appending keeps the old contents, including NULs and invalid UTF-8.
  appendFileSync(path, blob);
  const view = new Uint8Array([99, 0, 255, 88]).subarray(1, 3);
  appendFileSync(path, view);
  appendFileSync(path, Buffer.alloc(0));
  console.log("append", readFileSync(path).toString("hex"));
  console.log("source", view[0], view[1]);
  try {
    readFileSync("no-such-file-1403.bin");
    console.log("no-throw");
  } catch (e) {
    if (e instanceof Error) {
      console.log("err", e.message);
    }
  }
  rmSync(path);
  // Empty appends create a missing file too; later writes still truncate.
  appendFileSync(path, Buffer.alloc(0));
  console.log("empty append", readFileSync(path).length);
  appendFileSync(path, new Uint8Array([128, 0, 255]));
  appendFileSync(path, "\n");
  console.log("created", readFileSync(path).toString("hex"));
  writeFileSync(path, Buffer.from("reset"));
  console.log("truncated", readFileSync(path).toString("utf8"));
  try {
    appendFileSync(path + ".missing/child", blob);
    console.log("no append error");
  } catch (e) {
    if (e instanceof Error) console.log("append error", e.name, e.message.includes("ENOENT"));
  }
  rmSync(path);
  console.log("done");
}
main();
