import { loadEnvFile } from "node:process";
import { URL } from "node:url";

function report(fn: () => unknown): void {
  try { console.log("result", fn()); }
  catch (error) {
    if (error instanceof Error) console.log(error.name, (error as Error & { code?: string }).code ?? "", error.message);
  }
}
report(() => loadEnvFile(42 as unknown as string));
report(() => loadEnvFile(false as unknown as string));
report(() => loadEnvFile({} as unknown as string));
report(() => loadEnvFile([] as unknown as string));
report(() => loadEnvFile(Symbol("path") as unknown as string));
report(() => loadEnvFile("a\0b"));
report(() => loadEnvFile(Buffer.from("a\0b")));
report(() => loadEnvFile(new Uint8Array([97, 0, 98])));
report(() => loadEnvFile(new URL("https://example.com/")));
report(() => loadEnvFile(new URL("file:///tmp/a%2fb")));
report(() => loadEnvFile("scriptc-env-missing"));
report(() => loadEnvFile("."));
console.log("recovered");
