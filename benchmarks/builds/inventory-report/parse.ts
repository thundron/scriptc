import type { Product } from "./types.ts";
import { normalize } from "./normalize.ts";
import { valid } from "./validate.ts";
export function parse(source: string): Product[] {
  const products: Product[] = [];
  let lineNumber = 0;
  for (const line of source.split("\n")) {
    lineNumber++;
    if (line.trim() === "") continue;
    const fields = line.split("\t");
    if (fields.length !== 5) throw new Error("invalid inventory line " + lineNumber);
    const product = { sku: fields[0]!, category: normalize(fields[1]!), name: fields[2]!, quantity: Number(fields[3]), price: Number(fields[4]) };
    if (!valid(product)) throw new Error("invalid product on line " + lineNumber);
    products.push(product);
  }
  return products;
}
