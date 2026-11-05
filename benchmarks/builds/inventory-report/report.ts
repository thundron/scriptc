import type { Product } from "./types.ts";
import { categories } from "./categories.ts";
import { rankCategories, rankReorders } from "./rank.ts";
import { render } from "./render.ts";
export function report(products: Product[], limit: number): string {
  return render(rankCategories(categories(products)), rankReorders(products), limit);
}
