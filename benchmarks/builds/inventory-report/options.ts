export interface Options { file: string; category: string; limit: number }
export function options(args: string[]): Options {
  let file = "";
  let category = "";
  let limit = 12;
  for (let i = 0; i < args.length; i++) {
    const argument = args[i]!;
    if (argument === "--category") category = args[++i]!;
    else if (argument === "--limit") limit = Number(args[++i]);
    else if (file === "") file = argument;
    else throw new Error("unexpected argument: " + argument);
  }
  if (file === "" || !Number.isInteger(limit) || limit < 1) throw new Error("expected an inventory file and positive limit");
  return { file, category, limit };
}
