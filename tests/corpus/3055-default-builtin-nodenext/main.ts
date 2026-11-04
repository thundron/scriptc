import fs from "node:fs";
import path from "path";
import url from "node:url";

console.log(fs.existsSync(process.cwd()) ? "cwd-exists" : "cwd-missing");
console.log(path.join("a", "b"));
console.log(url.fileURLToPath("file:///tmp/x.txt"));
