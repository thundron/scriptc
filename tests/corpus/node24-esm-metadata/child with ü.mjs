import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const { filename, url, main, dirname: directory } = import.meta;
export const child = {
  main,
  base: basename(filename),
  encoded: url.includes("child%20with%20%C3%BC.mjs"),
  bridge: fileURLToPath(url) === filename && dirname(filename) === directory,
  fields: import.meta["url"] === url && import.meta[`main`] === main,
};
