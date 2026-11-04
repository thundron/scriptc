import { readFileSync, writeFileSync } from "node:fs";
import { Ts7SourceParser } from "../../../packages/compiler/src/frontend/ts7/source-parser.js";
import { cjsLexedExportsOfFile, cjsVisibleNames } from "../../../packages/compiler/src/frontend/cjs-syntax.js";
import { rewriteBundlerCjsSyntax } from "../../../packages/compiler/src/frontend/npm-static-rewrite-syntax.js";
import { helperTokens } from "../../../packages/compiler/src/frontend/helper-tokens.js";

interface Request {
  lex: { name: string; src: string }[];
  rewrite: { name: string; source: string; stamped: string[]; stars: { specifier: string; names: string[] }[] }[];
  tokens: string[];
}

export function runCjsClient(parser: Ts7SourceParser, input: string, output: string): void {
  const request = JSON.parse(readFileSync(input, "utf8")) as Request;
  const lex = request.lex.map((item) => {
    const result = cjsLexedExportsOfFile(parser.parse("module.cjs", item.src, "js"));
    return { name: item.name, exports: [...result.exports].sort(), reexports: result.reexports };
  });
  const rewrite = request.rewrite.map((item) => {
    const stars = new Map<string, Set<string>>();
    for (const entry of item.stars) stars.set(entry.specifier, new Set(entry.names));
    const stamped = new Set(item.stamped);
    const calls: string[] = [];
    const file = parser.parse("bundle.js", item.source, "js");
    const original = cjsLexedExportsOfFile(file);
    const result = rewriteBundlerCjsSyntax(file, "/virtual/bundle.js", {
      requireTargetEsModuleStamped: (from, spec) => { calls.push("stamp:" + from + ":" + spec); return stamped.has(spec); },
      starTargetNames: (from, spec) => { calls.push("star:" + from + ":" + spec); return stars.get(spec) ?? new Set<string>(); },
    });
    const rewritten = typeof result === "string" ? cjsLexedExportsOfFile(parser.parse("bundle.js", result, "js")) : original;
    return {
      name: item.name, result, calls,
      original: { exports: [...original.exports].sort(), reexports: original.reexports },
      rewritten: { exports: [...rewritten.exports].sort(), reexports: rewritten.reexports },
    };
  });
  const graph = new Map<string, string>([
    ["entry", 'exports.own = 1; module.exports = require("middle");'],
    ["middle", 'exports.middle = 1; module.exports = require("entry"); __exportStar(require("leaf"), exports);'],
    ["leaf", 'exports.leaf = 1; __exportStar(require("missing"), exports);'],
  ]);
  const names = cjsVisibleNames("entry",
    (name) => cjsLexedExportsOfFile(parser.parse(name + ".cjs", graph.get(name)!, "js")),
    (_from, spec) => graph.has(spec) ? spec : null,
  );
  const tokens = request.tokens.map((source) => helperTokens(source));
  writeFileSync(output, JSON.stringify({ lex, rewrite, names: [...names].sort(), tokens }));
}
