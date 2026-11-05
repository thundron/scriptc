import { basename, dirname as pathDirname } from "node:path";
import { fileURLToPath } from "node:url";
import { child } from "./child with ü.mjs";

const key = "url";
const { filename, dirname: directory, main, [key]: url } = import.meta;
const { filename: duplicate, filename: again } = (import.meta);
const { main: localMain } = import.meta;
process.chdir("..");
console.log("entry", main, localMain, basename(filename), basename(directory));
console.log("keys", import.meta["filename"] === filename, import.meta[key] === url, (import.meta).dirname === directory);
console.log("bridge", fileURLToPath(url) === filename, pathDirname(filename) === directory, duplicate === again);
console.log("child", child.main, child.base, child.encoded, child.bridge, child.fields);

function local() {
  const { filename: here, main: isMain = false } = import.meta;
  console.log("local", basename(here), isMain);
}
local();
