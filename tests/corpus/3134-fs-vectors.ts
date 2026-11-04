// Vector I/O preserves descriptor position and scatters only transferred bytes.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
const scratch = path.join(os.tmpdir(), `scr-3134-${process.pid}`);
const fd = fs.openSync(scratch, "w+");
try {
  const source = [Buffer.from("abc"), Buffer.alloc(0), Buffer.from("def")];
  console.log("writev current:", fs.writevSync(fd, source));
  console.log("writev positioned:", fs.writevSync(fd, [Buffer.from("XY"), Buffer.from("Z")], 1));
  const eof = [Buffer.alloc(2, 46)];
  console.log("position preserved:", fs.readvSync(fd, eof), eof[0]!.toString());
  const buffers = [Buffer.alloc(2, 46), Buffer.alloc(0), Buffer.alloc(6, 46)];
  console.log("readv scatter:", fs.readvSync(fd, buffers, 0), buffers[0]!.toString(), buffers[2]!.toString());
  console.log("readv tail:", fs.readvSync(fd, [Buffer.alloc(1)], 5));
  console.log("empty write bypass:", fs.writevSync(-1, []));
  fs.fdatasyncSync(fd);
  fs.ftruncateSync(fd, 3);
  console.log("truncate:", fs.fstatSync(fd).size);
  fs.ftruncateSync(fd, 8);
  console.log("extend:", fs.readFileSync(scratch).toString("hex"));
  fs.ftruncateSync(fd, -1);
  console.log("negative truncate:", fs.fstatSync(fd).size);
  fs.ftruncateSync(fd);
  try { fs.ftruncateSync(fd, 1.5); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("length error:", err.name, err.code, err.message); }
  try { fs.readvSync(-1, []); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("descriptor error:", err.name, err.code, err.message); }
} finally {
  fs.closeSync(fd);
  fs.unlinkSync(scratch);
}
try { fs.fdatasyncSync(fd); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("closed datasync:", err.name, err.code, err.message); }
try { fs.readvSync(fd, [Buffer.alloc(0)]); } catch (e) { const err = e as NodeJS.ErrnoException; console.log("closed zero vector:", err.name, err.code, err.message); }
