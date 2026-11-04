import { options } from "./options.ts";
import { load } from "./load.ts";
import { select } from "./select.ts";
import { report } from "./report.ts";
const args = options(process.argv.slice(2));
console.log(report(select(load(args.file), args.category), args.limit));
