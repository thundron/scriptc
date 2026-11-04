import { count, hasPrefix, name, normalize, type Entry, type Named } from "./model.ts";
export function describe<T extends Named>(value: T | undefined): string {
  return normalize(name(value));
}
export function read(entries: Entry[], index: number): string {
  return describe(entries[index]) + ":" + String(count(entries[index]));
}
export function matching(entries: Entry[], prefix: string): number {
  let total = 0;
  for (let index = 0; index < entries.length; index++) {
    if (hasPrefix(name(entries[index]), prefix)) total += count(entries[index]);
  }
  return total;
}
export function pair<T extends Named>(a: T | undefined, b: T | undefined): string {
  return name(a) + ":" + name(b);
}
export function invoke(read: (text: string) => string, input: string): string {
  return read(input);
}
export function inspect(value: Named | undefined, mutation: () => void): string {
  mutation();
  return name(value);
}
