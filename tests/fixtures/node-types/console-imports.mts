import { log as print, info, debug, warn, error } from "node:console";
import * as output from "node:console";
import * as namespace from "console";
import { createRequire } from "node:module";

var load = createRequire(import.meta.url);
const required = load("node:console") as typeof import("node:console");
print("named %s %d", "console", 7);
info("info", { ok: true });
debug("debug", [1, 2]);
warn("warn", null);
error("error", -0);
output.log("node namespace", { a: "b" });
namespace.log("namespace");
required.log("require");
