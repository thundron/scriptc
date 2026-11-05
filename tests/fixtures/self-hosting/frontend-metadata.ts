import { npmStaticTransformPkgJson } from "../../../packages/compiler/src/frontend/npm-static.js";
import { resolveExports } from "../../../packages/compiler/src/frontend/resolve.js";
import type { Ts7CompilerOptions } from "../../../packages/compiler/src/frontend/ts7/program-host.js";

// Execute the production package rewrite, including recursive visits to
// unknown dictionaries, arrays, and conditional exports. The output is
// compared to the same code executed by Node.
const packages = [
  '{"name":"simple","types":"index.d.ts","typings":"old.d.ts","exports":{"import":"./esm.js","require":"./cjs.js","types":"./index.d.ts"}}',
  '{"name":"nested","exports":{".":{"node":{"import":"./node.mjs","require":"./node.cjs"},"default":"./web.js","types":"./types.d.ts"},"./feature/*":{"import":"./esm/*.js","require":"./lib/*.js"}}}',
  '{"name":"fallbacks","exports":{".":[null,{"types":"./one.d.ts","node":{"default":"./one.js"}},"./two.js"],"./empty":null}}',
  '{"name":"leaf","exports":"./index.js"}',
  '{"name":"empty"}',
];
for (const text of packages) {
  const parsed = JSON.parse(text) as Record<string, unknown>;
  npmStaticTransformPkgJson(parsed);
  console.log(JSON.stringify(parsed));
  const exports = parsed["exports"];
  for (const path of [".", "./feature/use", "./empty", "./missing"]) {
    console.log(path, resolveExports(exports, path, new Set(["node", "import", "default"])));
  }
}

// The frontend consumes the generated TS7 option shape while reading
// user options from JSON. Merge the actual type with the same field/index
// contributors as program.ts, retaining defaults and forced values.
const defaults: Ts7CompilerOptions = { strict: true, target: 9, lib: ["lib.es2023.d.ts"], noEmit: true };
const selected: Record<string, unknown> = { strict: false, target: 7, module: 99, paths: { "@app/*": ["src/*"] } };
const forced: Ts7CompilerOptions = { noEmit: true, strictNullChecks: true };
const options: Ts7CompilerOptions = { ...defaults, ...selected, ...forced };
console.log(options.strict, options.strictNullChecks, options.noEmit, options.target, options.module);
console.log(options.lib === defaults.lib, options.lib?.join(","));
if (options.paths !== undefined) console.log(JSON.stringify(options.paths));

interface PackageView { name?: string; type?: string; exports: unknown; workspaces: unknown }
const view: PackageView = {
  name: "compiler", type: "module", exports: { ".": { import: "./index.js" } }, workspaces: ["packages/*"],
};
console.log(JSON.stringify(view));
view.workspaces = undefined;
console.log(JSON.stringify(view));
