import type { Product } from "./types.ts";
export function valid(product: Product): boolean {
  return product.sku.length > 0 && product.category.length > 0 && product.name.length > 0 &&
    Number.isInteger(product.quantity) && product.quantity >= 0 &&
    Number.isInteger(product.price) && product.price >= 0;
}
