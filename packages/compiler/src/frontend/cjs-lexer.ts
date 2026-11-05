/** Node entry for CommonJS export detection. Native callers pass their
 * parsed source directly to cjs-syntax and own the parser lifecycle. */
import { cjsLexedExportsOfFile, cjsVisibleNames, type CjsLexedExports } from "./cjs-syntax.js";
import { parseSourceFile } from "./ts7/source-parser-node.js";
export type { CjsLexedExports } from "./cjs-syntax.js";

export function cjsLexedExportsOf(source: string, fileName = "module.cjs"): CjsLexedExports {
  return cjsLexedExportsOfFile(parseSourceFile(fileName, source, "js"));
}

export function cjsLexerVisibleNames<H>(
  mod: H,
  sourceOf: (mod: H) => string,
  resolveCjsDep: (from: H, spec: string) => H | null,
  memo: Map<H, Set<string>> = new Map(),
): Set<string> {
  return cjsVisibleNames(mod, (item) => cjsLexedExportsOf(sourceOf(item)), resolveCjsDep, memo);
}
