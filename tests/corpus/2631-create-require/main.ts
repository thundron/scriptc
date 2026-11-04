// node:module — createRequire's static erasure: the const binding over
// createRequire(import.meta.url) erases, its require calls take static
// literals — a relative .json document bakes and parses (the
// version-reading pattern), a builtin spec makes the binding a namespace
// import in const clothing, and a bare name nothing installed resolves
// throws Node's catchable MODULE_NOT_FOUND. builtinModules is the baked
// Node v24 list.
import { builtinModules, createRequire } from "node:module";

const require = createRequire(import.meta.url);

// A relative .json document: require IS JSON.parse of the file.
const cfg = require("./cfg.json") as {
  name: string;
  version: string;
  port: number;
  tags: string[];
  nested: { deep: boolean };
};
console.log("cfg:", cfg.name, cfg.version, cfg.port, cfg.tags.join("+"), cfg.nested.deep);

// A builtin through the destructured spelling: the bindings key the
// same tables as named imports (the `as typeof import(...)` cast is the
// idiom — require answers `unknown`).
const { join, basename } = require("node:path") as typeof import("node:path");
console.log("path:", join("a", "b", "c.txt"), basename("/x/y/z.txt"));

// A builtin namespace binding: members lower through the module tables.
const os = require("node:os") as typeof import("node:os");
console.log("os:", os.platform() === process.platform, os.tmpdir().length > 0);

// The inline spelling erases the same way.
const inline = createRequire(import.meta.url)("./cfg.json") as { port: number };
console.log("inline:", inline.port);

// Bundled let/var syntax can still have an immutable loader value. A
// hoisted function sees it only after initialization, and a shadow's
// assignment does not mutate the module binding.
var bundledLoader = createRequire(import.meta.url);
let stableLoader = createRequire(import.meta.url);
const bundledPath = bundledLoader("node:path") as typeof import("node:path");
function readBundledPort(): number {
  return (bundledLoader("./cfg.json") as { port: number }).port;
}
function shadowLoader(bundledLoader: string): string {
  bundledLoader = "local";
  return bundledLoader;
}
console.log("bundled:", readBundledPort(), bundledPath.join("a", "b"), shadowLoader("original"));
console.log("stable:", (stableLoader("./cfg.json") as { port: number }).port, bundledLoader.resolve("node:path"), stableLoader.resolve.paths("node:path") === null);
const importedConsole = bundledLoader("node:console") as typeof import("node:console");
importedConsole.log("createRequire console", { port: readBundledPort() });
const { info: loaderInfo } = stableLoader("console") as typeof import("console");
loaderInfo("createRequire console alias");

// A bare specifier nothing installed resolves: Node's MODULE_NOT_FOUND,
// catchable at the call — the optional-dependency try/require pattern.
try {
  require("surely-not-installed-anywhere");
  console.log("SHOULD NOT PRINT");
} catch (e) {
  const err = e as NodeJS.ErrnoException;
  console.log("missing:", err.code, `${err.message}`.split("\n")[0]);
}

// builtinModules: the v24 list — bare names plus the node:-prefix-only
// tails, exactly as Node ships them.
console.log(
  "builtins:",
  builtinModules.length,
  builtinModules.includes("fs"),
  builtinModules.includes("stream/consumers"),
  builtinModules.includes("node:test"),
  builtinModules.includes("test"),
  builtinModules[0],
);
