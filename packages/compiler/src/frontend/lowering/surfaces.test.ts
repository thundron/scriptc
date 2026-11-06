import { expect, test } from "vitest";
import type { Lowerer } from "./lowerer.js";
import { builtinModuleConstOf } from "./surfaces.js";

const hintNames = ["ADDRCONFIG", "ALL", "V4MAPPED"] as const;

test.each([
  ["linux", [0x20, 0x10, 0x08]],
  ["darwin", [0x400, 0x100, 0x800]],
  ["win32", [0x400, 0x100, 0x800]],
] as const)(
  "DNS hint constants follow the %s target, not the compiling host",
  (targetPlatform, expected) => {
    const lowerer = { targetPlatform } as Lowerer;
    expect(hintNames.map((name) => builtinModuleConstOf(lowerer, "dns", name))).toEqual(expected);
    expect(hintNames.map((name) => builtinModuleConstOf(lowerer, "dns/promises", name))).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
    expect(builtinModuleConstOf(lowerer, "dns", "NOTFOUND")).toBe("ENOTFOUND");
    expect(builtinModuleConstOf(lowerer, "dns/promises", "NOTFOUND")).toBe("ENOTFOUND");
    expect(builtinModuleConstOf(lowerer, "path", "sep")).toBe(
      targetPlatform === "win32" ? "\\" : "/",
    );
    expect(builtinModuleConstOf(lowerer, "os", "EOL")).toBe(
      targetPlatform === "win32" ? "\r\n" : "\n",
    );
    expect(builtinModuleConstOf(lowerer, "path/posix", "sep")).toBe("/");
    expect(builtinModuleConstOf(lowerer, "path/win32", "sep")).toBe("\\");
  },
);
