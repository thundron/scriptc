import { join, basename } from "node:path";
import { platform } from "node:os";

const load = process.getBuiltinModule;
console.log(typeof load, load === process.getBuiltinModule);
const copy = load;
console.log(copy === load, copy === process.getBuiltinModule);
try { copy(null); } catch (error) { console.log(error.code, error.message); }
function localLoader() {
  const local = process.getBuiltinModule;
  console.log(local === process.getBuiltinModule, local("missing"));
  try { local(42); } catch (error) { console.log(error.code, error.message); }
  var mutable = process.getBuiltinModule;
  console.log(mutable === local);
  try { mutable(); } catch (error) { console.log(error.code, error.message); }
  mutable = (id) => "custom:" + id;
  console.log(mutable("path"));
}
localLoader();
const path = load("path");
console.log(path === load("node:path"), path === load("path/posix"), path.win32 === load("path/win32"));
console.log(path.posix === path, path.win32.posix === path, path.win32.win32 === path.win32);
console.log(path.join("a", "b", "..", "c"), path.basename("/a/file.ts", ".ts"));
console.log(path.normalize("/a/../b"), path.dirname("/a/file.ts"), path.extname("a.ts"));
console.log(path.isAbsolute("/a"), path.relative("/a", "/a/b"));
console.log(path.win32.join("a", "b"), path.win32.isAbsolute("C:\\a"));
console.log(path.sep, path.delimiter, path.win32.sep, path.win32.delimiter);
const stored = path.join;
console.log(stored === path.join, stored === join, path.basename === basename, stored("a", "b"));
const original = path.basename;
path.basename = (name) => "changed:" + name;
console.log(load("path").basename("x"), original("/a/x"));
path.basename = original;
const os = load("os");
console.log(os.platform() === platform(), os === load("node:os"), typeof os.homedir(), typeof os.totalmem());
const worker = load("node:worker_threads");
console.log(worker === load("worker_threads"), worker.isMainThread, worker.isInternalThread, worker.threadId, worker.parentPort, worker.workerData);
console.log(load("missing"), load("node:missing"), load("node:node:path"), load("node:node:test"), load("./path"), load("test"));
for (const id of [undefined, null, 42, {}, [], true]) {
  try { load(id); } catch (error) { console.log(error.name, error.code, error.message); }
}
let effects = "";
function extra() { effects += "e"; return 1; }
try { process.getBuiltinModule(null, extra()); } catch (error) { console.log(error.code, effects); }
function local(process) { return process.getBuiltinModule("custom"); }
console.log(local({ getBuiltinModule(name) { return name + "!"; } }));
