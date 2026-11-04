export interface WasmMemory {
  buffer: ArrayBuffer;
}

export interface WasmInstance {
  exports: Record<string, unknown>;
}

interface WasmModuleConstructor {
  new (bytes: Uint8Array): unknown;
  exports(module: unknown): { name: string; kind: string }[];
  imports(module: unknown): { module: string; name: string; kind: string }[];
}

interface WasmInstanceConstructor {
  new (module: unknown, imports: Record<string, unknown>): WasmInstance;
}

export const wasmApi = (
  globalThis as unknown as {
    WebAssembly: {
      Module: WasmModuleConstructor;
      Instance: WasmInstanceConstructor;
    };
  }
).WebAssembly;
