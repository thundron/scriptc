import { pathToFileURL } from "node:url";
import * as posix from "node:path/posix";

const paths = [
  "/work/a b#c?d%.ts", "/work/./one/../two/", "/back\\slash/",
  "C:\\work\\a b#c?d%.ts", "C:\\one\\..\\two\\", "D:/mixed\\path/",
  "\\\\server\\share\\a b.txt", "\\\\server\\share\\one\\..\\two\\",
  "/unicode/é-水-😀", "/control/\t\n\r", "/percent/%2F%5C", "/quotes/\"'`<>^{}|",
];
for (const path of paths) {
  for (const windows of [false, true]) {
    const url = pathToFileURL(path, { windows });
    console.log(windows, url.href, url.protocol, url.hostname, url.pathname, url.search, url.hash);
  }
}

// An omitted option retains the host default; compare values within each
// process so its own working directory and platform remain authoritative.
console.log("empty-options", pathToFileURL("relative", {}).href === pathToFileURL("relative").href);
function defaults(windows: boolean | undefined): boolean {
  return pathToFileURL("relative", { windows }).href === pathToFileURL("relative").href;
}
console.log("undefined-option", defaults(undefined));
console.log("posix-relative", posix.resolve("relative"));
console.log("posix-roundtrip", posix.relative(posix.resolve("."), posix.resolve("relative")));

const events: string[] = [];
function path(): string { events.push("path"); return "C:\\work\\file.ts"; }
function platform(): boolean { events.push("windows"); return true; }
console.log("order", pathToFileURL(path(), { windows: platform() }).href, events.join(","));

for (const path of ["\\\\server", "\\\\\\share"]) {
  try { console.log("invalid", pathToFileURL(path, { windows: true }).href); }
  catch (error) {
    if (error instanceof TypeError) console.log("caught", error.name, error.message);
  }
}
console.log("recovery", pathToFileURL("/after/failure", { windows: false }).href);
