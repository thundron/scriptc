#!/usr/bin/env node
// Loud, non-fatal check run by `build`. The prebuilt helper is optional (only
// the LLVM lane needs it) and expensive to build, so a missing artifact warns
// with the exact command instead of failing the workspace build.
import { accessSync, constants } from "node:fs";
import { fileURLToPath } from "node:url";

if (process.platform !== "darwin" || process.arch !== "arm64") process.exit(0);

const bin = fileURLToPath(new URL("../bin/scriptc-llvm-codegen", import.meta.url));
try {
  accessSync(bin, constants.X_OK);
  process.exit(0);
} catch {}

process.stderr.write(
  "\n@scriptc/llvm-darwin-arm64: bin/scriptc-llvm-codegen is MISSING (LLVM lane will fail with SC3003).\n" +
  "  Build it:   pnpm --filter @scriptc/llvm-darwin-arm64 run build:native\n" +
  "  Requires:   LLVM 22.1.8 exactly  ->  brew install llvm@22\n" +
  "  Not needed for the C backend; ignore if you only use `--backend c`.\n\n",
);
process.exit(0);
