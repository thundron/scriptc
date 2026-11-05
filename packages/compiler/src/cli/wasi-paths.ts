import { tmpdir } from "node:os";
import { wasiGuestPath } from "../wasi-paths.js";

/** Host paths exposed by `scriptc run` to a WASI Preview 1 module. Guest
 * `/tmp` maps to the host's real platform temp directory instead of assuming
 * the POSIX spelling exists (notably false on Windows). */
export function wasiPreopens(
  cwd: string = process.cwd(),
  hostTmp: string = tmpdir(),
): Record<string, string> {
  return { "/": cwd, "/tmp": hostTmp };
}

/** Environment inherited by a WASI module. Host-absolute directory values
 * must not claim paths outside the guest namespace: `/` is the module's
 * capability root/home/cwd and `/tmp` is its writable temporary directory. */
export function wasiEnvironment(
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
  hostTmp: string = tmpdir(),
): Record<string, string> {
  const guest: Record<string, string> = {};
  for (const [name, value] of Object.entries(env)) {
    if (value !== undefined) guest[name] = value;
  }

  guest["PWD"] = "/";
  guest["HOME"] = "/";
  guest["TMPDIR"] = "/tmp";
  if (guest["USERPROFILE"] !== undefined) guest["USERPROFILE"] = "/";
  if (guest["TMP"] !== undefined) guest["TMP"] = "/tmp";
  if (guest["TEMP"] !== undefined) guest["TEMP"] = "/tmp";

  // These optional shell/package-manager paths retain their meaning only
  // when they fall under a capability the runner actually exposes.
  for (const key of ["OLDPWD", "INIT_CWD"]) {
    const value = guest[key];
    if (value === undefined) continue;
    const mapped = wasiGuestPath(value, cwd, hostTmp);
    if (mapped === null) delete guest[key];
    else guest[key] = mapped;
  }

  return guest;
}
