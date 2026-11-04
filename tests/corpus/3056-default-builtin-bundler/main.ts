import os from "node:os";
import path from "node:path";

console.log(path.join("a", "b"), os.EOL === "\n");
