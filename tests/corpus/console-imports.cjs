const output = require("node:console");
const { log: print, info, debug, warn, error } = require("console");
const member = require("node:console").log;

output.log("namespace", { value: 1 });
output.warn("namespace stderr", [false]);
print("named %s %d", "stdout", 2);
info("info", [1, 2]);
debug("debug", null);
warn("warn", { text: "stderr" });
error("error", -0);
member("member import");
require("console").log("inline require");

const { createRequire } = require("node:module");
const load = createRequire(__filename);
const loaded = load("node:console");
loaded.log("CommonJS createRequire");
const memberCreateRequire = require("node:module").createRequire;
const memberLoad = memberCreateRequire(__filename);
const memberLoaded = memberLoad("console");
memberLoaded.info("CommonJS member createRequire");

// Names alone never identify a builtin.
function shadow(output, print) {
  output.log("local namespace");
  print("local name");
}
shadow({ log: (value) => console.log("object", value) }, (value) => console.log("function", value));
