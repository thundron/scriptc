import { parseArgs } from "node:util";

const options = {
  output: { type: "string", short: "o" },
  verbose: { type: "boolean", default: false },
  keep: { type: "boolean", default: true },
  include: { type: "string", multiple: true },
} as const;

type Arguments = ReturnType<typeof parseArgs<{ options: typeof options; allowPositionals: true; allowNegative: true }>>;
function parse(args: string[]): Arguments {
  return parseArgs({ args, options, allowPositionals: true, allowNegative: true });
}
function print(args: string[]): void {
  const { values, positionals } = parse(args);
  console.log(values.output ?? "none", values.verbose, values.keep);
  console.log((values.include ?? []).join(":"), positionals.join(":"));
}
print(["build", "input.ts", "-o", "program", "--verbose", "--no-keep", "--include=one", "--include", "two"]);
print([]);
try { parse(["--unknown"]); } catch (error) { console.log(error instanceof Error ? error.message.split("\n")[0] : String(error)); }

// Similar user declarations retain their own structural field types.
type ParsedResults = { values: number; positionals: boolean };
function local(value: ParsedResults): number { return value.positionals ? value.values : 0; }
console.log(local({ values: 42, positionals: true }));
