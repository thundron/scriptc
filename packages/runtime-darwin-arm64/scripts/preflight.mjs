#!/usr/bin/env node
// Loud, non-fatal check run by `build`. The precompiled runtime pack is
// optional (only native lanes link it) so a missing artifact warns with the
// exact command instead of failing the workspace build.
import { accessSync, constants } from "node:fs";
import { fileURLToPath } from "node:url";

if (process.platform !== "darwin" || process.arch !== "arm64") process.exit(0);

const root = new URL("../", import.meta.url);
try {
  accessSync(fileURLToPath(new URL("runtime-pack.json", root)), constants.R_OK);
  accessSync(fileURLToPath(new URL("artifacts", root)), constants.R_OK);
  process.exit(0);
} catch {}

process.stderr.write(
  "\n@scriptc/runtime-darwin-arm64: runtime-pack.json/artifacts are MISSING (native link will fail).\n" +
    "  Build it:   pnpm --filter @scriptc/runtime-darwin-arm64 run build:native\n\n",
);
process.exit(0);
