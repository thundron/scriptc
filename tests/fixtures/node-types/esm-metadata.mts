import { basename, dirname as pathDirname } from "node:path";
import { fileURLToPath } from "node:url";
const { filename, dirname, main, url } = import.meta;
const key = "filename";
const computed: string = import.meta[key];
const here: string = filename;
const directory: string = dirname;
const isMain: boolean = main;
console.log(basename(here), computed === here, pathDirname(here) === directory, isMain, fileURLToPath(url) === here);
function nested(): void {
  const { url: localURL, main: localMain } = (import.meta);
  console.log(localURL === url, localMain);
}
nested();
