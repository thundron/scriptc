import { parse } from "./parse.ts";
export interface Route { path: string; count: number; errors: number; milliseconds: number; bytes: number }
export function summarize(source: string, minimum: number): Route[] {
  const routes = new Map<string, Route>();
  for (const line of source.split("\n")) {
    const request = parse(line);
    if (request === null || request.status < minimum) continue;
    let route = routes.get(request.route);
    if (route === undefined) {
      route = { path: request.route, count: 0, errors: 0, milliseconds: 0, bytes: 0 };
      routes.set(request.route, route);
    }
    route.count++;
    route.errors += request.status >= 400 ? 1 : 0;
    route.milliseconds += request.milliseconds;
    route.bytes += request.bytes;
  }
  return [...routes.values()].sort((a, b) => b.count - a.count || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}
