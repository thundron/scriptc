import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("../", import.meta.url));
const socket = createServer();
await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
const port = socket.address().port;
await new Promise((resolve) => socket.close(resolve));

const server = spawn(process.execPath, [fileURLToPath(import.meta.resolve("next/dist/bin/next")), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd,
  env: { ...process.env, NODE_ENV: "production" },
  stdio: "inherit",
});
const exited = new Promise((resolve) => server.once("exit", resolve));
const origin = `http://127.0.0.1:${port}`;
let tests;

try {
  const deadline = Date.now() + 60_000;
  let ready = false;
  while (Date.now() < deadline && server.exitCode === null) {
    try {
      const response = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(1000) });
      await response.body?.cancel();
      if (response.ok) { ready = true; break; }
    } catch { /* The production server is still starting. */ }
    await sleep(100);
  }
  assert.ok(ready, "Build the docs before running route tests.");
  tests = spawn(process.execPath, ["--test", "test/routes.test.mjs"], {
    cwd,
    env: { ...process.env, DOCS_TEST_URL: origin },
    stdio: "inherit",
  });
  process.exitCode = await new Promise((resolve) => tests.once("exit", (code) => resolve(code ?? 1)));
} finally {
  tests?.kill("SIGTERM");
  server.kill("SIGTERM");
  const timeout = setTimeout(() => server.kill("SIGKILL"), 5000);
  await exited;
  clearTimeout(timeout);
}
