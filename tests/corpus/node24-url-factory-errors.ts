function report(fn: () => unknown): void {
  try { console.log("result", fn()); }
  catch (error) { if (error instanceof Error) console.log(error.name, error.message, (error as Error & { code?: string }).code ?? ""); }
}

// @ts-expect-error Exercise Node's missing-argument contract.
report(() => URL.canParse());
// @ts-expect-error Exercise Node's missing-argument contract.
report(() => URL.parse());
report(() => URL.canParse(undefined as unknown as string));
report(() => URL.parse(undefined as unknown as string));
report(() => URL.canParse(Symbol("input") as unknown as string));
report(() => URL.parse(Symbol("input") as unknown as string));
report(() => URL.canParse("https://example.com", Symbol("base") as unknown as string));
report(() => URL.parse("https://example.com", Symbol("base") as unknown as string));
const bad = { toString: (): string => { throw new Error("conversion failed"); } };
report(() => URL.canParse(bad as unknown as string));
report(() => URL.parse(bad as unknown as string));
report(() => URL.canParse("invalid", bad as unknown as string));
report(() => URL.parse("invalid", bad as unknown as string));
console.log(URL.canParse("invalid"), URL.parse("invalid") === null, "after errors");
console.log(URL.parse("https://example.com/after")?.href);
