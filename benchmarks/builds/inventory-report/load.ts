import { readFileSync } from "node:fs";
import { parse } from "./parse.ts";
export function load(file: string) { return parse(readFileSync(file, "utf8")); }
