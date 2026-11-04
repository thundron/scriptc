import type { Product } from "./types.ts";
import { lowStockThreshold, reorderTarget } from "./config.ts";
export function lowStock(product: Product): boolean { return product.quantity < lowStockThreshold; }
export function reorderUnits(product: Product): number { return lowStock(product) ? reorderTarget - product.quantity : 0; }
