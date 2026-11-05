export class Entry {
  key: string;
  count: number;
  constructor(key: string, count: number) {
    this.key = key;
    this.count = count;
  }
}
export interface Named { key: string; }
export function name<T extends Named>(value: T | undefined): string {
  return value === undefined ? "missing" : value.key;
}
export function count(value: Entry | undefined): number {
  return value === undefined ? -1 : value.count;
}
export function hasPrefix(value: string, prefix: string): boolean {
  return value.startsWith(prefix);
}
export function normalize(value: string): string {
  return value.trim().toLowerCase();
}
export function keep<T>(value: T): T { return value; }
