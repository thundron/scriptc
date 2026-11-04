import { SourceLocations } from "../../../packages/compiler/src/backend/source-locations.js";

// Exercise the real compiler module, including every offset around each
// newline form, astral characters, empty files, and failed lookups.
const text = "one\r\ntwo\rthree\nfour\u2028five\u2029😀six\n";
const sources = new Map<string, string>();
sources.set("main.ts", text);
sources.set("empty.ts", "");
sources.set("other.ts", "other");
const locations = new SourceLocations(sources);
for (const file of ["main.ts", "empty.ts", "other.ts", "missing.ts"]) {
  for (let start = -1; start <= text.length + 1; start++) {
    console.log(JSON.stringify(locations.position({ file, start, end: start })));
  }
}
