import type { Category, Product } from "./types.ts";
import { lowStock } from "./stock.ts";
export function categories(products: Product[]): Category[] {
  const groups = new Map<string, Category>();
  for (const product of products) {
    let group = groups.get(product.category);
    if (group === undefined) {
      group = { name: product.category, products: 0, units: 0, value: 0, lowStock: 0 };
      groups.set(product.category, group);
    }
    group.products++;
    group.units += product.quantity;
    group.value += product.quantity * product.price;
    group.lowStock += lowStock(product) ? 1 : 0;
  }
  return [...groups.values()];
}
