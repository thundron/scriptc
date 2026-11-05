import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const directory = mkdtempSync(join(tmpdir(), "scriptc-write-union-"));
const path = join(directory, "data");
function write(value: string | Uint8Array): void { writeFileSync(path, value); }
function append(value: string | Uint8Array): void { appendFileSync(path, value); }
let order = "";
function destination(): string { order += "path "; return path; }
function data(bytes: boolean): string | Uint8Array {
  order += "data ";
  return bytes ? Buffer.from([0, 128, 255]) : "é";
}
try {
  for (const value of ["text", new Uint8Array([0, 128, 255]), Buffer.from("é"), "", new Uint8Array(0)]) {
    write(value);
    append("!");
    append(Buffer.from([0, 255]));
    console.log(readFileSync(path).toString("hex"));
  }
  writeFileSync(destination(), data(true));
  appendFileSync(destination(), data(false));
  console.log(order);
  console.log(readFileSync(path).toString("hex"));
} finally { rmSync(directory, { recursive: true, force: true }); }
