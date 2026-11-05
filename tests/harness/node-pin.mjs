/* The corpus oracle is the RUNNING Node, while the compiler targets the
 * version in .node-version. When they differ, a handful of cases fail for
 * environmental reasons (a changed error string, a tightened argument check,
 * a different bundled Undici) and look like compiler bugs. Say so up front. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function setup() {
  const pinned = readFileSync(new URL("../../.node-version", import.meta.url), "utf8").trim();
  const running = process.versions.node;
  if (running === pinned) return;
  const dir = fileURLToPath(new URL("../..", import.meta.url));
  process.stderr.write(
    `\n  NODE VERSION MISMATCH: running ${running}, .node-version pins ${pinned}.\n` +
      `  The differential oracle is the running Node, so some cases will fail for\n` +
      `  environmental reasons. Run the suite on the pinned version:\n\n` +
      `    curl -sL https://nodejs.org/dist/v${pinned}/node-v${pinned}-darwin-arm64.tar.gz | tar xz -C /tmp\n` +
      `    PATH=/tmp/node-v${pinned}-darwin-arm64/bin:$PATH corepack pnpm exec vitest run tests/harness\n\n` +
      `  (in ${dir})\n\n`,
  );
}
