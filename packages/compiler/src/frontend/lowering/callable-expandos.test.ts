import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { analyze } from "../../index.js";

const declaration = `type Validator = ((value: unknown) => boolean) & {errors: string[] | null};
function validate(value: unknown): boolean { validate.errors = null as string[] | null; return value !== null; }
`;

function diagnostics(source: string): string[] {
  const directory = mkdtempSync(join(tmpdir(), "scriptc-callable-expando-"));
  try {
    const entry = join(directory, "main.ts");
    writeFileSync(entry, declaration + source);
    return analyze(entry).coverage.diagnostics.map((diagnostic) => diagnostic.code);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("initialized function declarations admit shared callable aliases", () => {
  expect(
    diagnostics(`validate.errors = null as string[] | null;
const alias: Validator = validate; alias.errors = ["bad"]; console.log(alias(1), validate.errors);`),
  ).toEqual([]);
});

test("materialization never invents an initial null for absent required properties", () => {
  expect(
    diagnostics(
      `const alias: Validator = validate; console.log(alias.errors); validate.errors = null as string[] | null;`,
    ),
  ).toContain("SC2002");
});

test("opaque extra properties cannot fall back to a detached width copy", () => {
  expect(
    diagnostics(`validate.errors = null as string[] | null; validate.metadata = {} as unknown;
const alias: Validator = validate; alias.errors = ["bad"]; console.log(validate.errors);`),
  ).toContain("SC2002");
});

test("unsupported reflection does not leak the internal call slot", () => {
  expect(
    diagnostics(`validate.errors = null as string[] | null;
const alias: Validator = validate; console.log(Object.keys(alias));`),
  ).toContain("SC1090");
});
