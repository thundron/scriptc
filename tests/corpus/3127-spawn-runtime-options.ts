import { spawn } from "node:child_process";
import type { SpawnOptions } from "node:child_process";

async function capture(command: string, args: string[], options: SpawnOptions | undefined): Promise<void> {
  const child = spawn(command, args, options);
  let spawned = false;
  child.on("spawn", () => { spawned = true; });
  child.unref();
  child.ref();
  let stdout = "";
  let stderr = "";
  child.stdout?.on("data", (chunk) => { stdout += chunk.toString(); });
  child.stderr?.on("data", (chunk) => { stderr += chunk.toString(); });
  await new Promise<void>((resolve) => {
    child.on("close", (code) => {
      console.log(spawned, code, JSON.stringify(stdout), JSON.stringify(stderr));
      resolve();
    });
  });
}

await capture("/bin/sh", ["-c", "printf default; printf error >&2"], undefined);
await capture("/bin/sh", ["-c", "printf '%s:%s' \"$PWD\" \"$GREETING\"; printf error >&2"], {
  stdio: ["ignore", "pipe", "pipe"], cwd: "/", detached: false,
  env: { GREETING: "hello", UNUSED: undefined }, shell: false, windowsHide: true,
});
await capture("/bin/sh", ["-c", "printf hidden"], { stdio: "ignore" });
await capture("printf shell", [], { stdio: "pipe", shell: true });
await new Promise<void>((resolve) => {
  const options: SpawnOptions = { stdio: "ignore" };
  spawn("/bin/echo", options).on("close", (code) => { console.log("options only", code); resolve(); });
});
const invalid: unknown[] = [null, 1, { detached: 1 }, { windowsHide: 1 }, { cwd: 1 }];
for (const options of invalid) {
  try {
    spawn("/bin/sh", [], options as SpawnOptions);
  } catch (error) {
    const failure = error as NodeJS.ErrnoException;
    console.log(failure.code, failure.message);
  }
}
