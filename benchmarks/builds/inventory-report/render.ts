import type { Category, Product } from "./types.ts";
import { money } from "./money.ts";
import { reorderUnits } from "./stock.ts";
import { revision } from "./config.ts";
export function render(groups: Category[], reorders: Product[], limit: number): string {
  const lines = ["inventory report " + revision, "category,products,units,value,low_stock"];
  for (const group of groups) lines.push([group.name, group.products, group.units, money(group.value), group.lowStock].join(","));
  lines.push("reorder_sku,units,cost");
  for (const product of reorders.slice(0, limit)) lines.push([product.sku, reorderUnits(product), money(reorderUnits(product) * product.price)].join(","));
  return lines.join("\n");
}
