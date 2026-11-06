import { join } from "node:path";
import { expect, test, vi } from "vitest";
import { analyze } from "../index.js";
import { runCli } from "./command.js";
import type { CliHost } from "./host.js";

const profile = join(
  import.meta.dirname,
  "../../../..",
  "tests/coverage-fixtures/library-union-spread/profile.json",
);
test("coverage --lib --profile reports the library refusal without compiling an artifact", async () => {
  const output: string[] = [];
  const unexpected = () => {
    throw new Error("coverage must not invoke artifact or runtime operations");
  };
  const host: CliHost = {
    version: () => "test",
    sourceTargetPlatform: () => "darwin",
    analyze: async (entry, options) => analyze(entry, options),
    compile: unexpected,
    compileLibrary: unexpected,
    resolveProvenanceSources: unexpected,
    warmNativeCaches: unexpected,
    mergeProfiles: unexpected,
    typePatches: unexpected,
    run: unexpected,
    reinvoke: unexpected,
  };
  const write = vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
    output.push(String(chunk));
    return true;
  });
  try {
    const status = await runCli(
      ["coverage", "--lib", "--profile", profile, "--fail-on=blockers", "--print=diagnostics"],
      host,
    );
    expect(status).toBe(1);
    const result = JSON.parse(output.join(""));
    expect(result.analysisMode).toBe("library");
    expect(result.diagnostics.some((item: { code: string }) => item.code === "SC2003")).toBe(true);
    expect(result.diagnostics.some((item: { code: string }) => item.code === "SC4001")).toBe(false);
  } finally {
    write.mockRestore();
  }
});
