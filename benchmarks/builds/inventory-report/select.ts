import type { Product } from "./types.ts";
import { normalize } from "./normalize.ts";
export function select(products: Product[], category: string): Product[] {
  const wanted = normalize(category);
  return wanted === "" ? products : products.filter(product => product.category === wanted);
}
