import type { IrWasmMemory } from "../ir/ir.js";

/** Both compiler drivers use one memory/link contract. A threaded pack carries
 * its own real pthread libc/CRT; the scalar Zig libc must never be substituted. */
export function wasmMemoryLinkFlags(memory?: IrWasmMemory): string[] {
  if (memory === undefined) return [];
  return [
    ...(memory.shared ? ["-nostdlib", "-matomics", "-mbulk-memory", "-Wl,--shared-memory"] : []),
    "-Wl,--import-memory",
    "-Wl,--export-memory",
    "-Wl,--export=_initialize",
    `-Wl,--initial-memory=${memory.initialPages * 65536}`,
    `-Wl,--max-memory=${memory.maximumPages * 65536}`,
    `-Wl,-z,stack-size=${memory.stackBytes}`,
  ];
}
