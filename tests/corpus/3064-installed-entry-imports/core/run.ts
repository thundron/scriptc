import { recordCall } from "../state.ts";

type Read = (bytes: Uint8Array) => number | null;

export function run(read: Read, write: (value: number) => void): void {
  const bytes = new Uint8Array(2);
  const count = read(bytes);
  if (count === null) return;
  recordCall();
  write(bytes[0] + count);
}

console.log("core init");
