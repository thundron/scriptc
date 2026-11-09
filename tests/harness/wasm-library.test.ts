import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { WASI } from "node:wasi";
import ts from "typescript";
import {
  allocateShared as allocateReference,
  shared as referenceView,
  releaseShared as releaseReference,
} from "@scriptc/experimental/f32";
import { build as referenceBvhBuild } from "../library-mode/float32-bvh/lib.ts";
import * as numericReference from "../library-mode/numeric-kernels/lib.ts";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import {
  compileLibrary as compileNodeLibrary,
  type CompileLibraryOptions,
} from "@scriptc/compiler";
import { NativeCompiler } from "../../packages/compiler/src/native/compiler.js";
import {
  nativeCodegenTarget,
  WASM32_WASI_TARGET,
} from "../../packages/compiler/src/backend/targets.js";
import { ts7Executable } from "../../packages/compiler/src/frontend/ts7/rpc-api.js";

// Run both compiler drivers against the same real checker transport in this
// harness. The production bootstrap separately exercises the native transport.
vi.mock("../../packages/compiler/src/frontend/pipeline-native.js", async () => {
  const { runFrontend } = await import("../../packages/compiler/src/frontend/pipeline.js");
  const { loadProgram } = await import("../../packages/compiler/src/frontend/program-node.js");
  return {
    runNativeFrontend: (
      entry: string,
      _executable: string,
      npmStatic?: readonly string[] | "auto" | "lib",
      externalTypes?: Readonly<Record<string, string>>,
      _evaluate?: unknown,
      libraryNpmStatic?: readonly string[],
    ) => runFrontend(entry, loadProgram, npmStatic, externalTypes, libraryNpmStatic),
  };
});

const fixture = join(import.meta.dirname, "../library-mode/wasm");
const hasZig = spawnSync("zig", ["version"]).status === 0;
const sharedFixture = join(import.meta.dirname, "../library-mode/shared-f32-jobs");
const hasThreadPack = (() => {
  try {
    return (
      JSON.parse(
        readFileSync(
          join(import.meta.dirname, "../../packages/runtime-wasm32-wasi/runtime-pack.json"),
          "utf8",
        ),
      ).flavors["library-thread-release"] !== undefined
    );
  } catch {
    return false;
  }
})();
type Api = Record<string, (...args: number[]) => number> & { memory: WebAssembly.Memory };

describe.skipIf(!hasZig).each(["node", "native"] as const)(
  "Wasm library embedding (%s driver)",
  (driver) => {
    let directory: string;
    let module: WebAssembly.Module;
    let oldTarget: string | undefined;
    let profile: any;
    let native: NativeCompiler;
    const compileLibrary = (options: CompileLibraryOptions) =>
      driver === "node"
        ? compileNodeLibrary(options)
        : Promise.resolve(native.compileLibrary(options));

    beforeAll(async () => {
      oldTarget = process.env["SCRIPTC_TARGET"];
      if (driver === "native") {
        const host = nativeCodegenTarget()!;
        const root = join(import.meta.dirname, "../..");
        const helperPackageRoot = join(
          root,
          "packages",
          host.helper.packageName.replace("@scriptc/", ""),
        );
        const compilerPackage = JSON.parse(
          await readFile(join(root, "packages/compiler/package.json"), "utf8"),
        );
        native = new NativeCompiler({
          compilerVersion: compilerPackage.version,
          target: WASM32_WASI_TARGET,
          helper: host.helper,
          helperPackageRoot,
          helperExecutable: join(
            helperPackageRoot,
            "bin",
            process.platform === "win32" ? "scriptc-llvm-codegen.exe" : "scriptc-llvm-codegen",
          ),
          runtimePackRoot: join(root, "packages/runtime-wasm32-wasi"),
          ts7Executable: ts7Executable(),
          linker: "zig",
          linkerArgs: ["cc"],
          dsymutil: "unused",
        });
      }
      process.env["SCRIPTC_TARGET"] = "wasm32-wasi";
      directory = await mkdtemp("/tmp/scriptc-wasm-library-test-");
      profile = JSON.parse(await readFile(join(fixture, "profile.json"), "utf8"));
      profile.entry = join(fixture, "lib.ts");
      const result = await compileLibrary({
        profilePath: join(fixture, "profile.json"),
        outDir: directory,
      });
      if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
      expect(result.archivePath.endsWith(".wasm")).toBe(true);
      module = new WebAssembly.Module(await readFile(result.archivePath));
    });

    afterAll(async () => {
      if (oldTarget === undefined) delete process.env["SCRIPTC_TARGET"];
      else process.env["SCRIPTC_TARGET"] = oldTarget;
      if (directory) await rm(directory, { recursive: true, force: true });
    });

    test("checked-dynamic integrity queries link in library runtime packs", async () => {
      const source = join(import.meta.dirname, "../library-mode/checked-adoption");
      const raw = JSON.parse(await readFile(join(source, "profile.json"), "utf8"));
      raw.entry = join(source, "main.ts");
      const profilePath = join(directory, "integrity-profile.json");
      await writeFile(profilePath, JSON.stringify(raw));
      const result = await compileLibrary({ profilePath, outDir: join(directory, "integrity") });
      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
      const host = await import(pathToFileURL(result.archivePath.replace(/\.wasm$/, ".mjs")).href);
      const api = await host.instantiateFromBytes(await readFile(result.archivePath));
      for (const text of ["{}", "[]", '{"x":42}', "null", "42", '"text"']) {
        const value: unknown = JSON.parse(text);
        expect(api.n_sealed(text)).toBe(Object.isSealed(value) ? 1 : 0);
        expect(api.n_extensible(text)).toBe(Object.isExtensible(value) ? 1 : 0);
      }
    });

    function instantiate(adjust?: (value: number, api: Api) => number) {
      const wasi = new WASI({ version: "preview1" });
      let api: Api;
      const reports: unknown[] = [];
      const panics: string[] = [];
      const text = (ptr: number, len: number) =>
        new TextDecoder().decode(new Uint8Array(api.memory.buffer, ptr, len));
      const instance = new WebAssembly.Instance(module, {
        ...wasi.getImportObject(),
        scriptc: {
          adjust: (value: number) => (adjust ? adjust(value, api) : value * 2),
          report: (p: number, n: number, b: number, size: number, flag: number) => {
            reports.push([
              text(p, n),
              Array.from(new Uint8Array(api.memory.buffer, b, size)),
              flag !== 0,
            ]);
          },
          panic: (p: number, n: number) => {
            const message = text(p, n);
            panics.push(message);
            throw new Error(message);
          },
        },
      });
      api = instance.exports as Api;
      wasi.initialize(instance);
      api.app_init();
      return { api, reports, panics, text };
    }

    test("finite union spread libraries preserve evaluation and own-key order", async () => {
      const profilePath = join(
        import.meta.dirname,
        "../library-mode/finite-union-spread/profile.json",
      );
      const result = await compileLibrary({ profilePath, outDir: join(directory, "union-spread") });
      if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
      const glue = await import(pathToFileURL(result.archivePath.replace(/\.wasm$/, ".mjs")).href);
      const api = await glue.instantiateFromBytes(await readFile(result.archivePath));
      const hash = (text: string): number => {
        let value = 0;
        for (let i = 0; i < text.length; i++) value = (value * 33 + text.charCodeAt(i)) | 0;
        return value;
      };
      for (const n of [-2, 0, 1.25, 3])
        expect(api.fus_run(n)).toBe(
          hash(JSON.stringify({ name: "x", sofa: { seats: 2, depth: n }, bed: { width: 160 } })),
        );
      for (const left of [-1, 1])
        for (const right of [-1, 1]) {
          let count = 0;
          const tick = (): number => ++count;
          const a = left > 0 ? { x: left } : { y: "r" };
          const b = right > 0 ? { x: "late" } : { z: false };
          expect(api.fus_product(left, right)).toBe(
            hash(JSON.stringify({ before: tick(), ...a, between: tick(), ...b, after: tick() })),
          );
        }
    });

    test("generated glue owns returned strings/bytes across growth and links checked unknown casts", async () => {
      const entry = join(directory, "owned-results.ts"),
        path = join(directory, "owned-results.json");
      await writeFile(
        entry,
        `let keep = new Uint8Array(0);
export function echo(text: string): string { return text + "λ\\0😀"; }
export function bytes(data: Uint8Array): Uint8Array { const result = new Uint8Array(data.length); for (let i=0;i<data.length;i++) result[i] = data[i]!; return result; }
export function grow(size: number): number { keep = new Uint8Array(size); return keep.length; }
export function cast(text: string): number { const raw: unknown = JSON.parse(text); return (raw as {x: number}).x; }
export function signed(): number { return -7; }
export function unsigned(): number { return 9007199254740991; }
`,
      );
      await writeFile(
        path,
        JSON.stringify({
          profile_format: 1,
          name: "owned_results",
          emission: "llvm",
          entry,
          abi: { prefix: "r_", init_symbol: "r_init", sink_register_symbol: "r_sink" },
          callbacks: [],
          exports: [
            { export: "echo", symbol: "r_echo", params: ["string"], returns: "string" },
            { export: "bytes", symbol: "r_bytes", params: ["bytes"], returns: "bytes" },
            { export: "grow", symbol: "r_grow", params: ["f64"], returns: "f64" },
            { export: "cast", symbol: "r_cast", params: ["string"], returns: "f64" },
            { export: "signed", symbol: "r_signed", params: [], returns: "i64" },
            { export: "unsigned", symbol: "r_unsigned", params: [], returns: "u64" },
          ],
        }),
      );
      const result = await compileLibrary({ profilePath: path, outDir: directory });
      if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
      const glue = await import(pathToFileURL(result.archivePath.replace(/\.wasm$/, ".mjs")).href);
      const api = await glue.instantiateFromBytes(await readFile(result.archivePath), {});
      expect(api.r_echo("é\0")).toBe("é\0λ\0😀");
      const returned = api.r_bytes(new Uint8Array([0, 127, 128, 255]));
      expect(api.r_grow(40 * 1024 * 1024)).toBe(40 * 1024 * 1024);
      api.r_bytes(new Uint8Array([9, 8, 7]));
      expect(Array.from(returned)).toEqual([0, 127, 128, 255]);
      expect(api.r_echo("")).toBe("λ\0😀");
      expect(api.r_bytes(new Uint8Array(0)).length).toBe(0);
      expect(api.r_cast('{"x":42}')).toBe(42);
      expect(api.r_signed()).toBe(-7n);
      expect(api.r_unsigned()).toBe(9007199254740991n);
      expect(() => api.r_cast('{"x":"wrong"}')).toThrow();
    });

    async function managedArtifact(name: string, shared: boolean, maximumPages = 4096) {
      const raw = JSON.parse(await readFile(join(sharedFixture, "profile.json"), "utf8"));
      raw.entry = join(sharedFixture, "lib.ts");
      raw.abi.instance_per_thread = shared;
      raw.abi.wasm_features = shared ? ["simd128"] : [];
      raw.abi.wasm_memory.shared = shared;
      raw.abi.wasm_memory.maximum_pages = maximumPages;
      const path = join(directory, name + ".json");
      await writeFile(path, JSON.stringify(raw));
      const result = await compileLibrary({
        profilePath: path,
        outDir: directory,
        outPath: join(directory, name + ".wasm"),
      });
      if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
      const bytes = await readFile(result.archivePath);
      const glue = await import(
        pathToFileURL(result.archivePath.replace(/\.wasm$/, ".mjs")).href + "?max=" + maximumPages
      );
      return { bytes, glue };
    }

    test.runIf(hasThreadPack)(
      "real pthreads share f32 bytes, isolate globals, retain job buffers and join teardown",
      async () => {
        const { bytes, glue } = await managedArtifact("managed-shared", true);
        const module = new WebAssembly.Module(bytes);
        expect(WebAssembly.Module.imports(module)).toContainEqual({
          module: "wasi",
          name: "thread-spawn",
          kind: "function",
        });
        expect(WebAssembly.Module.exports(module)).toContainEqual({
          name: "wasi_thread_start",
          kind: "function",
        });
        expect(glue.requiredFeatures).toEqual(["simd128", "threads"]);
        expect(glue.memoryABI).toMatchObject({
          shared: true,
          initialPages: 256,
          maximumPages: 4096,
        });
        const typed = join(directory, "typed-managed.mts");
        await writeFile(
          typed,
          `
import {createRuntime} from './managed-shared.mjs';
const runtime=await createRuntime(new Uint8Array());
const buffer=runtime.buffer(8);
const number:number=await runtime.call('run',[buffer,0,8,1]);
const text:string=await runtime.call('text',['hi']);
const bytes:Uint8Array<ArrayBuffer>=await runtime.call('bytes',[new Uint8Array()]);
const snapshot:Float32Array<ArrayBuffer>=buffer.readFloat32();
// @ts-expect-error no undeclared export
runtime.call('missing',[]);
// @ts-expect-error wrong ABI argument class
runtime.call('text',[123]);
// @ts-expect-error returned strings are not numbers
const wrong:number=await runtime.call('text',['hi']);
void [number,text,bytes,snapshot,wrong];await runtime.close();
`,
        );
        const program = ts.createProgram([typed], {
          noEmit: true,
          strict: true,
          module: ts.ModuleKind.NodeNext,
          target: ts.ScriptTarget.ES2024,
          skipLibCheck: true,
          types: [],
        });
        expect(
          ts
            .getPreEmitDiagnostics(program)
            .map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")),
        ).toEqual([]);
        const browserHost = join(directory, "browser-buffer-source.mjs");
        await writeFile(
          browserHost,
          `
const decode=TextDecoder.prototype.decode;
TextDecoder.prototype.decode=function(value,...rest){if(value?.buffer instanceof SharedArrayBuffer)throw new TypeError("browser TextDecoder rejects shared BufferSource");return decode.call(this,value,...rest);};
const random=crypto.getRandomValues;
crypto.getRandomValues=function(value){if(value.buffer instanceof SharedArrayBuffer)throw new TypeError("browser crypto rejects shared BufferSource");return random.call(this,value);};
export function createHost(){return {};}
`,
        );
        const runtime = await glue.createRuntime(
          bytes,
          {},
          { workers: 2, workerHostModule: pathToFileURL(browserHost).href },
        );
        try {
          expect(runtime.capabilities).toMatchObject({
            mode: "threads",
            sharedMemory: true,
            simd: true,
            workers: 2,
          });
          expect(await Promise.all([runtime.call("state", []), runtime.call("state", [])])).toEqual(
            [1111, 1111],
          );
          for (const value of [-0, NaN, Infinity, -Infinity, 1.25])
            expect(Object.is(await runtime.call("echo", [value]), value)).toBe(true);
          expect(await runtime.call("text", ["é\0"])).toBe("é\0λ\0😀");
          expect(await runtime.call("cstring", ["hello"])).toBe("hello✓");
          const returned = await runtime.call("bytes", [new Uint8Array([0, 127, 128, 255])]);
          expect(Array.from(returned)).toEqual([0, 127, 128, 255]);
          expect(await runtime.call("randomOkay", [])).toBe(1);
          const data = runtime.buffer(64),
            input = Float32Array.from({ length: 64 }, (_, i) => i / 4);
          data.writeFloat32(input);
          expect(
            await Promise.all([
              runtime.call("run", [data, 0, 32, 1.5]),
              runtime.call("run", [data, 32, 64, 2.5]),
            ]),
          ).toEqual([1, 1]);
          const snapshot = data.readFloat32();
          expect(Array.from(snapshot)).toEqual(
            Array.from(input, (v, i) => Math.fround(v + (i < 32 ? 1.5 : 2.5))),
          );
          const expectedSum = snapshot.reduce((total, value) => Math.fround(total + value), 0);
          expect(
            await Promise.all(Array.from({ length: 4 }, () => runtime.call("readOnlySum", [data]))),
          ).toEqual([expectedSum, expectedSum, expectedSum, expectedSum]);
          expect(Array.from(data.readFloat32())).toEqual(Array.from(snapshot));
          const large = runtime.buffer(8 * 1024 * 1024);
          large.writeUint32(new Uint32Array([0x80000000, 0x7fc00000, 0x7f800000]));
          expect(Array.from(large.readUint32(0, 3))).toEqual([0x80000000, 0x7fc00000, 0x7f800000]);
          expect(Object.is(large.readFloat32(0, 1)[0], -0)).toBe(true);
          expect(large.readFloat32(1, 1)[0]).toBeNaN();
          large.release();
          expect(Array.from(data.readFloat32())).toEqual(Array.from(snapshot));
          await expect(runtime.call("constructor", [])).rejects.toThrow("unknown wasm export");
          await expect(runtime.call("sum", [{}])).rejects.toThrow("ABI scalars");
          for (let i = 0; i < 4200; i++)
            await expect(
              runtime.call("sum", [data], { signal: { aborted: false } }),
            ).rejects.toThrow("AbortSignal");
          expect(await runtime.call("sum", [data])).toBeGreaterThan(0);
          const handle = data.handle;
          const pending = runtime.call("run", [data, 0, 64, 1]);
          data.release();
          await expect(pending).resolves.toBeGreaterThan(1);
          await expect(runtime.call("sum", [data])).rejects.toThrow("released");
          expect(await runtime.call("valid", [handle])).toBe(-1);
          expect(Array.from(snapshot)).toEqual(
            Array.from(input, (v, i) => Math.fround(v + (i < 32 ? 1.5 : 2.5))),
          );
        } finally {
          await runtime.close();
        }
        await runtime.close();
        await expect(runtime.call("sum", [1])).rejects.toThrow("closed");
        // Fresh memory must not inherit prior globals, handles, or shutdown state.
        for (let i = 0; i < 3; i++) {
          const fresh = await glue.createRuntime(bytes, {}, { workers: 2 });
          try {
            const data = fresh.buffer(4);
            expect(await fresh.call("run", [data, 0, 4, 1])).toBe(1);
            expect(Array.from(data.readFloat32())).toEqual([1, 1, 1, 1]);
            data.release();
          } finally {
            await fresh.close();
          }
        }
      },
      120000,
    );

    test.runIf(hasThreadPack)(
      "timeout, abort, queue bounds and traps discard all shared worker contexts",
      async () => {
        const { bytes, glue } = await managedArtifact("managed-failures", true);
        const slowHost = join(directory, "slow-worker-host.mjs");
        await writeFile(
          slowHost,
          "await new Promise(resolve=>setTimeout(resolve,10000));export function createHost(){return {}};",
        );
        for (const hostModule of [
          pathToFileURL(join(directory, "missing-worker-host.mjs")).href,
          pathToFileURL(slowHost).href,
        ])
          await expect(
            glue.createRuntime(
              bytes,
              {},
              { workers: 2, startupTimeoutMs: 100, workerHostModule: hostModule },
            ),
          ).rejects.toThrow();
        for (const kind of ["timeout", "abort", "close", "trap"]) {
          const runtime = await glue.createRuntime(bytes, {}, { workers: 1, maxQueuedJobs: 1 });
          const controller = new AbortController();
          try {
            if (kind === "trap") {
              await expect(runtime.call("run", [0, 0, 4, 1])).rejects.toThrow();
            } else {
              const pending = runtime.call("forever", [], {
                timeoutMs: kind === "timeout" ? 50 : 3000,
                signal: controller.signal,
              });
              const rejected = expect(pending).rejects.toThrow();
              const queued = runtime.call("valid", [0]);
              const queuedRejected = expect(queued).rejects.toThrow();
              await expect(runtime.call("valid", [0])).rejects.toThrow("queue is full");
              if (kind === "abort") controller.abort();
              if (kind === "close") await runtime.close();
              await rejected;
              await queuedRejected;
            }
            await expect(runtime.call("valid", [0])).rejects.toThrow("closed");
          } finally {
            await runtime.close();
          }
        }
      },
      120000,
    );

    test.runIf(hasThreadPack)(
      "controller helper traps poison the shared memory before any reuse",
      async () => {
        const { bytes, glue } = await managedArtifact("managed-controller-traps", true);
        for (const name of [
          "scriptc_shared_f32_retain",
          "scriptc_shared_f32_data",
          "scriptc_shared_f32_release",
        ]) {
          const actual = WebAssembly.instantiate.bind(WebAssembly);
          const instantiate = vi
            .spyOn(WebAssembly, "instantiate")
            .mockImplementation(async (module, imports) => {
              const instance = await actual(module, imports);
              return {
                exports: {
                  ...instance.exports,
                  [name]() {
                    throw new Error("controller helper trapped");
                  },
                },
              } as WebAssembly.Instance;
            });
          let runtime;
          try {
            runtime = await glue.createRuntime(bytes, {}, { workers: 2 });
          } finally {
            instantiate.mockRestore();
          }
          try {
            const data = runtime.buffer(4);
            expect(() => data.readFloat32()).toThrow("controller helper trapped");
            expect(runtime.memoryBytes).toBe(0);
            await expect(runtime.call("valid", [0])).rejects.toThrow("closed");
          } finally {
            await runtime.close();
          }
        }
      },
      120000,
    );

    test("explicit private memory is a scalar equivalent and memory bounds invalidate link caches", async () => {
      for (const maximum of [4096, 8192, 4096]) {
        const { bytes, glue } = await managedArtifact("managed-private", false, maximum);
        const runtime = await glue.createRuntime(bytes);
        try {
          expect(runtime.capabilities).toMatchObject({
            mode: "scalar",
            sharedMemory: false,
            simd: false,
          });
          const data = runtime.buffer(8);
          data.writeFloat32(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]));
          expect(await runtime.call("run", [data, 0, 8, 10])).toBe(1);
          expect(Array.from(data.readFloat32())).toEqual([11, 12, 13, 14, 15, 16, 17, 18]);
          const pending = runtime.call("run", [data, 0, 8, 1]);
          data.release();
          await expect(pending).resolves.toBe(2);
        } finally {
          await runtime.close();
        }
      }
      if (hasThreadPack) {
        const shared = await managedArtifact("managed-fallback-shared", true);
        const scalar = await managedArtifact("managed-fallback-scalar", false);
        vi.stubGlobal("SharedArrayBuffer", undefined);
        try {
          let reason = "";
          const runtime = await shared.glue.createRuntime(
            shared.bytes,
            {},
            {
              fallback: (why: string) => {
                reason = why;
                return scalar.glue.createRuntime(scalar.bytes);
              },
            },
          );
          try {
            expect(reason).toContain("isolation");
            expect(runtime.capabilities.sharedMemory).toBe(false);
          } finally {
            await runtime.close();
          }
        } finally {
          vi.unstubAllGlobals();
        }
        const validate = vi.spyOn(WebAssembly, "validate").mockReturnValue(false);
        try {
          const runtime = await shared.glue.createRuntime(
            shared.bytes,
            {},
            { fallback: () => scalar.glue.createRuntime(scalar.bytes) },
          );
          try {
            expect(runtime.capabilities.simd).toBe(false);
          } finally {
            await runtime.close();
          }
        } finally {
          validate.mockRestore();
        }
        const actualValidate = WebAssembly.validate.bind(WebAssembly);
        const atomics = vi.spyOn(WebAssembly, "validate").mockImplementation((bytes) => {
          const view =
            bytes instanceof ArrayBuffer
              ? new Uint8Array(bytes)
              : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
          return view.includes(254) ? false : actualValidate(bytes);
        });
        try {
          let reason = "";
          const runtime = await shared.glue.createRuntime(
            shared.bytes,
            {},
            {
              fallback: (why: string) => {
                reason = why;
                return scalar.glue.createRuntime(scalar.bytes);
              },
            },
          );
          try {
            expect(reason).toContain("threads/atomics");
            expect(runtime.capabilities.sharedMemory).toBe(false);
          } finally {
            await runtime.close();
          }
        } finally {
          atomics.mockRestore();
        }
      }
    }, 120000);

    test.each(["scalar", "simd", "threads"])(
      "binary32 BVH forest matches Node bit-for-bit (%s)",
      async (mode, context) => {
        if (mode === "threads" && !hasThreadPack) context.skip();
        const source = join(import.meta.dirname, "../library-mode/float32-bvh");
        const profile = JSON.parse(await readFile(join(source, "profile.json"), "utf8"));
        profile.entry = join(source, "lib.ts");
        profile.abi.instance_per_thread = mode === "threads";
        profile.abi.wasm_memory.shared = mode === "threads";
        profile.abi.wasm_features = mode === "scalar" ? [] : ["simd128"];
        const path = join(directory, "bvh-" + mode + ".json");
        await writeFile(path, JSON.stringify(profile));
        const result = await compileLibrary({
          profilePath: path,
          outDir: directory,
          outPath: join(directory, "bvh-" + mode + ".wasm"),
        });
        if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
        if (spawnSync("wasm-dis", ["--version"]).status === 0) {
          const disassembly = execFileSync("wasm-dis", [result.archivePath], {
            encoding: "utf8",
            maxBuffer: 8 * 1024 * 1024,
          });
          if (mode === "scalar") expect(disassembly).not.toContain("f32x4.");
          else
            for (const op of ["add", "mul", "min", "max"])
              expect(disassembly).toContain("f32x4." + op);
          if (mode === "threads") expect(disassembly).toContain("i32.atomic.load");
        }
        const glue = await import(
          pathToFileURL(result.archivePath.replace(/\.wasm$/, ".mjs")).href
        );
        const runtime = await glue.createRuntime(
          await readFile(result.archivePath),
          {},
          { workers: 4 },
        );
        const count = 256,
          jobs = 4,
          stride = (count * 2 - 1) * 16,
          triangles = new Float32Array(jobs * count * 12);
        let seed = 12345;
        for (let i = 0; i < triangles.length; i++) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          triangles[i] = i % 4 === 3 ? 0 : (seed / 4294967296) * 200 - 100;
        }
        const input = allocateReference(triangles.length),
          output = allocateReference(jobs * stride);
        try {
          referenceView(input).set(triangles);
          const areas = Array.from({ length: jobs }, (_, job) =>
            referenceBvhBuild(input, job * count, count, output, job * stride),
          );
          const expected = new Uint32Array(referenceView(output).buffer).slice();
          const inBuffer = runtime.buffer(triangles.length),
            outBuffer = runtime.buffer(jobs * stride);
          inBuffer.writeFloat32(triangles);
          expect(
            await Promise.all(
              Array.from({ length: jobs }, (_, job) =>
                runtime.call("build", [inBuffer, job * count, count, outBuffer, job * stride]),
              ),
            ),
          ).toEqual(areas);
          const actual = outBuffer.readUint32();
          expect(actual).toEqual(expected);
          const bounds = new Float32Array(actual.buffer);
          for (let job = 0; job < jobs; job++) {
            const base = job * stride;
            expect(actual[base + 15]).toBe(count);
            for (let n = 0; n < count - 1; n++) {
              const p = base + n * 16,
                l = base + actual[p + 12]! * 16,
                r = base + actual[p + 13]! * 16;
              for (let axis = 0; axis < 3; axis++) {
                expect(bounds[p + axis]).toBe(Math.min(bounds[l + axis]!, bounds[r + axis]!));
                expect(bounds[p + 4 + axis]).toBe(
                  Math.max(bounds[l + 4 + axis]!, bounds[r + 4 + axis]!),
                );
              }
            }
          }
          // Reuse the live pool and backing allocations, not only fresh instances.
          expect(await runtime.call("build", [inBuffer, 0, count, outBuffer, 0])).toBe(areas[0]);
          expect(outBuffer.readUint32()).toEqual(expected);
          if (mode === "threads" && Number(process.env.SCRIPTC_WASM_STRESS) > 0) {
            const rounds = Number(process.env.SCRIPTC_WASM_STRESS);
            expect(Number.isSafeInteger(rounds) && rounds <= 100000).toBe(true);
            const batch = async () => {
              const allocated = Array.from({ length: jobs }, (_, job) => {
                const input = runtime.buffer(count * 12),
                  output = runtime.buffer(stride);
                input.writeFloat32(triangles.subarray(job * count * 12, (job + 1) * count * 12));
                return { input, output };
              });
              try {
                const values = await Promise.all(
                  allocated.map(({ input, output }) =>
                    runtime.call("build", [input, 0, count, output, 0]),
                  ),
                );
                expect(values.every((value) => Number.isFinite(value) && value > 0)).toBe(true);
              } finally {
                for (const { input, output } of allocated) {
                  input.release();
                  output.release();
                }
              }
            };
            for (let i = 0; i < 16; i++) await batch();
            const bytes = runtime.memoryBytes;
            for (let i = 0; i < Math.ceil(rounds / jobs); i++) await batch();
            expect(runtime.memoryBytes).toBe(bytes);
            expect(outBuffer.readUint32()).toEqual(expected);
          }
          inBuffer.release();
          outBuffer.release();
        } finally {
          releaseReference(input);
          releaseReference(output);
          await runtime.close();
        }
      },
      120000,
    );

    test("exports only the callable ABI and requires named host imports", () => {
      expect(
        WebAssembly.Module.exports(module)
          .map((e) => e.name)
          .sort(),
      ).toEqual(
        [
          "_initialize",
          "memory",
          "scriptc_alloc",
          "scriptc_free",
          "app_init",
          "app_collect",
          "app_reset_results",
          "app_step",
          "app_echo",
          "app_bytes",
          "app_fail",
        ].sort(),
      );
      expect(
        WebAssembly.Module.imports(module)
          .filter((e) => e.module === "scriptc")
          .map((e) => e.name)
          .sort(),
      ).toEqual(["adjust", "panic", "report"]);
      expect(
        () => new WebAssembly.Instance(module, { scriptc: {}, wasi_snapshot_preview1: {} }),
      ).toThrow();
    });

    test("matches Node across stateful calls, strings, buffers, and host callbacks", () => {
      const { api, reports, text } = instantiate();
      const values = [api.app_step(3), api.app_step(-2), api.app_step(0.5)];
      const input = new TextEncoder().encode("λ\0hello");
      const ptr = api.scriptc_alloc(input.length + 8);
      new Uint8Array(api.memory.buffer, ptr, input.length).set(input);
      const out = ptr + input.length;
      api.app_echo(ptr, input.length, out, out + 4);
      let view = new DataView(api.memory.buffer);
      const resultPtr = view.getUint32(out, true),
        resultLen = view.getUint32(out + 4, true);
      const echo = text(resultPtr, resultLen);
      new Uint8Array(api.memory.buffer, ptr, 3).set([0, 254, 255]);
      api.app_bytes(ptr, 3, out, out + 4);
      view = new DataView(api.memory.buffer);
      const bytes = Array.from(
        new Uint8Array(api.memory.buffer, view.getUint32(out, true), view.getUint32(out + 4, true)),
      );
      // An explicit reset entry keeps earlier results live across later calls.
      expect(text(resultPtr, resultLen)).toBe(echo);
      api.scriptc_free(ptr);
      api.app_reset_results();
      api.app_collect();
      const reference = execFileSync(
        process.execPath,
        [
          "--no-warnings",
          "--input-type=module",
          "-e",
          `
      const reports=[];
      globalThis.adjust=x=>x*2;
      globalThis.report=(s,b,f)=>reports.push([s,Array.from(b),f]);
      const api=await import(${JSON.stringify(join(fixture, "lib.ts"))});
      const values=[api.step(3),api.step(-2),api.step(0.5)];
      const echo=api.echo("λ\\0hello");
      const bytes=Array.from(api.bytes(new Uint8Array([0,254,255])));
      console.log(JSON.stringify({values,echo,bytes,reports}));
    `,
        ],
        { encoding: "utf8" },
      );
      expect({ values, echo, bytes, reports }).toEqual(JSON.parse(reference));
    });

    test("numeric kernels preserve exact results without temporary arrays", async () => {
      const source = join(import.meta.dirname, "../library-mode/numeric-kernels");
      const settings = JSON.parse(await readFile(join(source, "profile.json"), "utf8"));
      settings.entry = join(source, "lib.ts");
      const profilePath = join(directory, "numeric-profile.json");
      await writeFile(profilePath, JSON.stringify(settings));
      const output = join(directory, "numeric-kernels");
      const result = await compileLibrary({ profilePath, outDir: output });
      expect(result.diagnostics ?? []).toEqual([]);
      expect(result.ok).toBe(true);
      const glue = await import(pathToFileURL(result.archivePath.replace(/\.wasm$/, ".mjs")).href);
      const api = (await glue.instantiateFromBytes(await readFile(result.archivePath), {})) as Api;
      const emitted = (
        await Promise.all(
          (await readdir(output))
            .filter((name) => name.endsWith(".ll"))
            .map((name) => readFile(join(output, name), "utf8")),
        )
      ).join("\n");
      const run = emitted.match(
        /define (?:internal )?[^\n]+ @sc_(?:b)?f_run(?:\.i32)?\([^\n]*\) #[0-9]+ \{([\s\S]*?)\n\}/,
      );
      expect(run).not.toBeNull();
      expect(run![1]).not.toMatch(/@scr_arr_new|@sc_b?f_.*idxOr/);
      expect(run![1]).toContain("bytes.fill.body");
      expect(emitted).toContain("@scr_math_hypot2");
      expect(emitted).toContain("@scr_math_hypot3");
      expect(emitted).toContain("@scr_wsa_alloc_");
      expect(emitted).toContain("numeric.reduce");
      expect(emitted).toContain("arr.push.batch");
      expect(emitted).toContain("arr.pop.nonempty");
      const values = [0, -0, 3, -4, 1e308, 1e-300, Infinity, -Infinity, NaN];
      for (const x of values)
        for (const y of values) {
          expect(Object.is(api["nk_two"]!(x, y), numericReference.two(x, y))).toBe(true);
          for (const z of values)
            expect(Object.is(api["nk_three"]!(x, y, z), numericReference.three(x, y, z))).toBe(
              true,
            );
        }
      for (const initial of [...values, 1.25, 4294967295, Number.MAX_SAFE_INTEGER])
        for (const n of [0, 1, 3, 24]) {
          expect(
            Object.is(api["nk_product"]!(n, initial), numericReference.product(n, initial)),
          ).toBe(true);
        }
      for (const x of values)
        for (const index of [0, -0, 1, 2, 3, -1, 0.5, Infinity, NaN]) {
          expect(Object.is(api["nk_literal"]!(x, index), numericReference.literal(x, index))).toBe(
            true,
          );
        }
      for (const seed of [-0, 1.25, 1e-300, 1e100])
        expect(Object.is(api["nk_run"]!(seed, 100), numericReference.run(seed, 100))).toBe(true);
      for (const x of values) {
        expect(Object.is(api["nk_map"]!(x), numericReference.mapSum(x))).toBe(true);
        expect(Object.is(api["nk_closed"]!(30, x), numericReference.closed(30, x))).toBe(true);
        expect(Object.is(api["nk_stack"]!(30, x), numericReference.stackSum(30, x))).toBe(true);
      }
      for (const n of [0, 0.5, 2.5, 1000])
        expect(api["nk_grow"]!(n)).toBe(numericReference.grow(n));
      for (const x of values)
        for (const index of [0, -0, 1, 2, 3, -1, 0.5, Infinity, NaN])
          expect(Object.is(api["nk_direct"]!(x, index), numericReference.direct(x, index))).toBe(
            true,
          );
      for (const n of [0, 1, 2, 8, 30]) {
        expect(api["nk_triples"]!(n)).toBe(numericReference.triples(n));
        expect(api["nk_affine"]!(n)).toBe(numericReference.affine(n));
        for (const x of values)
          expect(Object.is(api["nk_extremes"]!(n, x), numericReference.extremes(n, x))).toBe(true);
      }
      const wasi = new WASI({ version: "preview1" });
      const instance = await WebAssembly.instantiate(await readFile(result.archivePath), {
        ...wasi.getImportObject(),
        scriptc: {
          panic: () => {
            throw new Error("numeric library panic");
          },
        },
      });
      const raw = instance.instance.exports as Api;
      wasi.initialize(instance.instance);
      raw["nk_init"]!();
      raw["nk_allocations"]!(128);
      raw["nk_recycled"]!(128);
      raw["nk_collect"]!();
      const bytes = raw.memory.buffer.byteLength;
      for (let i = 0; i < 1000; i++) {
        const n = 64 + (i % 64);
        expect(raw["nk_allocations"]!(n)).toBe(numericReference.allocations(n));
        expect(raw["nk_recycled"]!(n)).toBe(numericReference.recycled(n));
        if (i % 100 === 0) raw["nk_collect"]!();
      }
      expect(raw.memory.buffer.byteLength).toBeLessThanOrEqual(bytes + 4 * 65536);
      const scalarEntry = join(directory, "scalar-numeric.ts"),
        scalarProfile = join(directory, "scalar-numeric.json");
      await writeFile(
        scalarEntry,
        "export function only(x:number,y:number):number {return Math.hypot(x,y);}",
      );
      await writeFile(
        scalarProfile,
        JSON.stringify({
          ...settings,
          entry: scalarEntry,
          exports: [{ export: "only", symbol: "nk_only", params: ["f64", "f64"], returns: "f64" }],
        }),
      );
      const scalar = await compileLibrary({
        profilePath: scalarProfile,
        outDir: join(directory, "scalar-numeric"),
      });
      expect(scalar.diagnostics ?? []).toEqual([]);
      expect(scalar.ok).toBe(true);
      const scalarGlue = await import(
        pathToFileURL(scalar.archivePath.replace(/\.wasm$/, ".mjs")).href
      );
      const scalarApi = await scalarGlue.instantiateFromBytes(
        await readFile(scalar.archivePath),
        {},
      );
      expect(scalarApi.nk_only(3, 4)).toBe(5);
    });

    test("SIMD profile changes are cache-isolated, Node-exact and feature-checked", async () => {
      const source = join(import.meta.dirname, "../library-mode/float32-lanes/lib.ts");
      const settings = JSON.parse(
        await readFile(
          join(import.meta.dirname, "../library-mode/float32-lanes/profile.json"),
          "utf8",
        ),
      );
      settings.entry = source;
      const profilePath = join(directory, "float32-profile.json");
      const reference = JSON.parse(
        execFileSync(
          process.execPath,
          [
            "--input-type=module",
            "-e",
            `
        const m = await import(${JSON.stringify(pathToFileURL(source).href)});
        const values = [m.run(0.123), ...Array.from({length: 32}, (_, i) => m.element(i)), m.overlap(), m.signedZero()];
        console.log(JSON.stringify(values));
      `,
          ],
          { encoding: "utf8" },
        ),
      );
      // Same path and output: changing only the feature flag must not hit an
      // incompatible frontend/object/artifact cache entry.
      for (const enabled of [false, true, false]) {
        if (enabled) settings.abi.wasm_features = ["simd128"];
        else delete settings.abi.wasm_features;
        await writeFile(profilePath, JSON.stringify(settings));
        const result = await compileLibrary({ profilePath, outDir: directory });
        if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
        const llvm = await readFile(result.llvmPath, "utf8");
        expect(llvm.includes('"target-features"="+simd128"')).toBe(enabled);
        expect(llvm).toContain("fadd <4 x float>");
        const bytes = await readFile(result.archivePath);
        expect(WebAssembly.validate(bytes)).toBe(true);
        const stem = result.archivePath.slice(0, -5);
        const glue = await import(
          pathToFileURL(stem + ".mjs").href + `?simd=${enabled}-${Date.now()}`
        );
        expect(glue.requiredFeatures ?? []).toEqual(enabled ? ["simd128"] : []);
        const api = await glue.instantiateFromBytes(bytes, {
          panic(message: string) {
            throw new Error(message);
          },
        });
        const values = [
          api.fl_run(0.123),
          ...Array.from({ length: 32 }, (_, i) => api.fl_element(i)),
          api.fl_overlap(),
          api.fl_signed_zero(),
        ];
        expect(values).toEqual(reference);
        if (enabled) {
          const validate = vi.spyOn(WebAssembly, "validate").mockReturnValue(false);
          try {
            await expect(glue.instantiateFromBytes(bytes, {})).rejects.toThrow(
              "requires WebAssembly SIMD128",
            );
          } finally {
            validate.mockRestore();
          }
        }
      }
    });

    test("instances isolate state and initialization resets the session", () => {
      const a = instantiate().api,
        b = instantiate().api;
      expect(a.memory).not.toBe(b.memory);
      expect(a.app_step(5)).toBe(17);
      expect(b.app_step(1)).toBe(9);
      a.app_init();
      expect(a.app_step(0)).toBe(7);
      expect(b.app_step(0)).toBe(9);
    });

    test("host allocations survive memory growth and collection", () => {
      const { api } = instantiate();
      const p = api.scriptc_alloc(16);
      new Uint8Array(api.memory.buffer, p, 16).fill(42);
      const original = api.memory.buffer;
      const big = api.scriptc_alloc(original.byteLength + 65536);
      expect(big).not.toBe(0);
      expect(api.memory.buffer).not.toBe(original);
      api.app_collect();
      expect(Array.from(new Uint8Array(api.memory.buffer, p, 16))).toEqual(Array(16).fill(42));
      api.scriptc_free(big);
      api.scriptc_free(p);
    });

    test("escaped exceptions poison only their instance", () => {
      const a = instantiate(),
        b = instantiate();
      expect(() => a.api.app_fail()).toThrow(/reactor failure/);
      expect(a.panics).toHaveLength(1);
      expect(a.panics[0]).toContain("app_fail");
      expect(() => a.api.app_step(1)).toThrow();
      expect(() => a.api.scriptc_alloc(8)).toThrow();
      expect(b.api.app_step(1)).toBe(9);
    });

    test.each([
      "app_init",
      "app_collect",
      "app_reset_results",
      "scriptc_alloc",
      "scriptc_free",
      "app_step",
    ])("rejects callback reentry through %s", (entry) => {
      const { api, panics } = instantiate((value, api) => api[entry](value));
      expect(() => api.app_step(2)).toThrow(/SC4026/);
      expect(panics[0]).toContain(entry);
    });

    test("an escaping host exception prevents reuse of the suspended instance", () => {
      const { api } = instantiate(() => {
        throw new Error("host failure");
      });
      expect(() => api.app_step(1)).toThrow("host failure");
      expect(() => api.app_init()).toThrow(/SC4026/);
    });

    test.each(["instance_per_thread", "localize_runtime"])(
      "refuses native-only %s",
      async (key) => {
        const path = join(directory, `${key}.json`);
        await writeFile(path, JSON.stringify({ ...profile, abi: { ...profile.abi, [key]: true } }));
        const result = await compileLibrary({ profilePath: path, outDir: directory });
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.diagnostics[0]?.code).toBe("SC3002");
      },
    );

    test("cstring parameters, results, and callback arguments use NUL-terminated pointers", async () => {
      const entry = join(directory, "cstring-lib.ts");
      await writeFile(
        entry,
        [
          "declare function log(text: string): void;",
          "export function greet(name: string): string {",
          "  log(name.toUpperCase());",
          "  return `hello, ${name}!`;",
          "}",
          "export function withNul(): string {",
          '  return "a\\u0000b";',
          "}",
          "",
        ].join("\n"),
      );
      const profilePath = join(directory, "cstring.json");
      await writeFile(
        profilePath,
        JSON.stringify({
          profile_format: 2,
          name: "wasm-cstring",
          entry,
          emission: "llvm",
          abi: {
            prefix: "cs_",
            init_symbol: "cs_init",
            sink_register_symbol: "cs_sink",
            callback_register_symbol: "cs_callback",
            collect_symbol: null,
            result_reset_symbol: null,
          },
          callbacks: [{ name: "log", params: ["cstring"], returns: "void" }],
          exports: [
            { export: "greet", symbol: "cs_greet", params: ["cstring"], returns: "cstring" },
            { export: "withNul", symbol: "cs_with_nul", params: [], returns: "cstring" },
          ],
        }),
      );
      const result = await compileLibrary({ profilePath, outDir: directory });
      if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
      const wasi = new WASI({ version: "preview1" });
      let api: Api;
      const logs: string[] = [];
      const panics: string[] = [];
      const cString = (ptr: number): string => {
        const memory = new Uint8Array(api.memory.buffer);
        let end = ptr;
        while (memory[end] !== 0) end++;
        return new TextDecoder().decode(memory.subarray(ptr, end));
      };
      const instance = new WebAssembly.Instance(
        new WebAssembly.Module(await readFile(result.archivePath)),
        {
          ...wasi.getImportObject(),
          scriptc: {
            log: (ptr: number) => logs.push(cString(ptr)),
            panic: (ptr: number, len: number) => {
              const message = new TextDecoder().decode(new Uint8Array(api.memory.buffer, ptr, len));
              panics.push(message);
              throw new Error(message);
            },
          },
        },
      );
      api = instance.exports as Api;
      wasi.initialize(instance);
      api.cs_init();
      const input = new TextEncoder().encode("w\u00f6rld\0");
      const ptr = api.scriptc_alloc(input.length);
      new Uint8Array(api.memory.buffer, ptr, input.length).set(input);
      expect(cString(api.cs_greet(ptr))).toBe("hello, w\u00f6rld!");
      expect(logs).toEqual(["W\u00d6RLD"]);
      api.scriptc_free(ptr);
      const glue = await import(pathToFileURL(result.archivePath.replace(/\.wasm$/, ".mjs")).href);
      const jsLogs: string[] = [];
      const jsApi = await glue.instantiateFromBytes(await readFile(result.archivePath), {
        log: (text: string) => jsLogs.push(text),
      });
      expect(jsApi.cs_greet("wörld")).toBe("hello, wörld!");
      expect(jsLogs).toEqual(["WÖRLD"]);
      expect(() => jsApi.cs_greet("bad\0argument")).toThrow(/NUL/);
      expect(jsApi.cs_greet("")).toBe("hello, !");
      expect(() => jsApi.cs_with_nul()).toThrow(/U\+0000/);
      expect(() => api.cs_with_nul()).toThrow();
      expect(panics).toHaveLength(1);
      expect(panics[0]).toContain("a cstring value contains U+0000");
    });

    test("refuses collisions with built-in Wasm exports and imports", async () => {
      for (const change of [
        {
          abi: {
            ...profile.abi,
            prefix: "scriptc_",
            init_symbol: "scriptc_alloc",
            sink_register_symbol: "scriptc_sink",
            callback_register_symbol: "scriptc_callback",
            collect_symbol: null,
            result_reset_symbol: null,
          },
          exports: [],
        },
        { callbacks: [{ name: "panic", params: [], returns: "void" }] },
      ]) {
        const path = join(directory, "reserved.json");
        await writeFile(path, JSON.stringify({ ...profile, ...change }));
        const result = await compileLibrary({ profilePath: path, outDir: directory });
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.diagnostics[0]?.message).toMatch(/reserved/);
      }
    });

    test.each(["release", "dev"])(
      "published three.js computes animated camera-space vertices in %s",
      async (optimization) => {
        const threeProfile = JSON.parse(await readFile(join(fixture, "three.json"), "utf8"));
        const profilePath = join(directory, `three-${optimization}.json`);
        await writeFile(
          profilePath,
          JSON.stringify({ ...threeProfile, entry: join(fixture, "three.mjs"), optimization }),
        );
        const result = await compileLibrary({ profilePath, outDir: directory });
        if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
        const wasi = new WASI({ version: "preview1" });
        let api: Api;
        const vertices: number[][] = [];
        const surfaces: number[][] = [];
        const resources: number[][] = [];
        const instance = new WebAssembly.Instance(
          new WebAssembly.Module(await readFile(result.archivePath)),
          {
            ...wasi.getImportObject(),
            scriptc: {
              vertex: (...args: number[]) => vertices.push(args.map((x) => Number(x.toFixed(9)))),
              surface: (...args: number[]) => surfaces.push(args.map((x) => Number(x.toFixed(9)))),
              resource: (...args: number[]) => resources.push(args),
              panic: (p: number, n: number) => {
                throw new Error(new TextDecoder().decode(new Uint8Array(api.memory.buffer, p, n)));
              },
            },
          },
        );
        api = instance.exports as Api;
        wasi.initialize(instance);
        api.app_init();
        for (const time of [0, 123, 2000]) expect(api.app_frame(time, 1.5)).toBe(24);
        api.app_dispose();
        const reference = spawnSync(
          process.execPath,
          [
            "--no-warnings",
            "--input-type=module",
            "-e",
            `
      const vertices=[],surfaces=[],resources=[];
      globalThis.vertex=(...args)=>vertices.push(args.map(x=>Number(x.toFixed(9))));
      globalThis.surface=(...args)=>surfaces.push(args.map(x=>Number(x.toFixed(9))));
      globalThis.resource=(...args)=>resources.push(args);
      const {frame,dispose}=await import(${JSON.stringify(join(fixture, "three.mjs"))});
      for (const time of [0,123,2000]) frame(time,1.5);
      dispose();
      console.log(JSON.stringify({vertices,surfaces,resources}));
    `,
          ],
          { encoding: "utf8" },
        );
        expect({
          stdout: JSON.stringify({ vertices, surfaces, resources }) + "\n",
          stderr: "",
          status: 0,
        }).toEqual({
          stdout: reference.stdout,
          stderr: reference.stderr,
          status: reference.status,
        });
        api.app_collect();
        api.app_init();
        expect(api.app_frame(0, 1)).toBe(24);
      },
    );
  },
);
