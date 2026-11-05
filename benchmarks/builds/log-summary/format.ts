import type { Route } from "./aggregate.ts";
export const revision = 0;
export function format(routes: Route[], limit: number): string {
  const lines = ["request report " + revision, "route,count,errors,mean_ms,bytes"];
  for (const row of routes.slice(0, limit)) {
    lines.push([row.path, row.count, row.errors, Math.round(row.milliseconds / row.count), row.bytes].join(","));
  }
  return lines.join("\n");
}
