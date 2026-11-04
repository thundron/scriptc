import { readFileSync } from "node:fs";
import { options } from "./options.ts";
import { summarize } from "./aggregate.ts";
import { format } from "./format.ts";
const args = options(process.argv.slice(2));
console.log(format(summarize(readFileSync(args.file, "utf8"), args.minimum), args.limit));
