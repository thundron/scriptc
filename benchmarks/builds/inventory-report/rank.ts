import type { Category, Product } from "./types.ts";
import { reorderUnits } from "./stock.ts";
export function rankCategories(rows: Category[]): Category[] {
  return rows.sort((a, b) => b.value - a.value || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}
export function rankReorders(products: Product[]): Product[] {
  return products.filter(product => reorderUnits(product) > 0).sort((a, b) =>
    reorderUnits(b) * b.price - reorderUnits(a) * a.price || (a.sku < b.sku ? -1 : a.sku > b.sku ? 1 : 0));
}
