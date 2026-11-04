import { parseEnv } from "node:util";

function report(fn: () => unknown): void {
  try { console.log("result", fn()); }
  catch (error) {
    if (error instanceof Error) console.log(error.name, (error as Error & { code?: string }).code ?? "", error.message);
  }
}
// @ts-expect-error Pin missing-argument validation.
report(() => parseEnv());
report(() => parseEnv(undefined as unknown as string));
report(() => parseEnv(null as unknown as string));
report(() => parseEnv(42 as unknown as string));
report(() => parseEnv(true as unknown as string));
report(() => parseEnv({ toString: () => "X=converted" } as unknown as string));
report(() => parseEnv(Symbol("x") as unknown as string));
report(() => parseEnv(1n as unknown as string));
report(() => parseEnv([] as unknown as string));
console.log(JSON.stringify(parseEnv("AFTER=errors")));
