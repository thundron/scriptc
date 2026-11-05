export interface Options { file: string; minimum: number; limit: number }
export function options(args: string[]): Options {
  let file = "";
  let minimum = 200;
  let limit = 10;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === "--min-status") minimum = Number(args[++i]);
    else if (arg === "--limit") limit = Number(args[++i]);
    else if (file === "") file = arg;
    else throw new Error("unexpected argument: " + arg);
  }
  if (file === "" || !Number.isInteger(minimum) || !Number.isInteger(limit) || limit < 1) {
    throw new Error("usage: log-summary <file> [--min-status <number>] [--limit <number>]");
  }
  return { file, minimum, limit };
}
