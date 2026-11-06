import { readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
process.env.SCRIPTC_RUNTIME_PACK_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
await import("../../runtime-pack-common/scripts/verify.mjs");

if (process.env.SCRIPTC_WASI_THREADS !== "0") {
  const manifest = JSON.parse(
    await readFile(new URL("../runtime-pack.json", import.meta.url), "utf8"),
  );
  if (!manifest.flavors["library-thread-release"] || !manifest.flavors["library-thread-dev"])
    throw new Error(
      "the WASI runtime pack is missing real pthread library flavors; rebuild it with the pinned WASI SDK",
    );
}
