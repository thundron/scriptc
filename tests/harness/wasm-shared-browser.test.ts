import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { expect, test } from "vitest";
import { compileLibrary } from "@scriptc/compiler";

// Optional real-browser lane: no browser/automation package is a compiler or
// application dependency. CDP uses Node 24's built-in WebSocket transport.
const chromium = process.env.SCRIPTC_CHROMIUM;
const root = join(import.meta.dirname, "../..");
const threaded = (() => {
  try {
    return !!JSON.parse(
      readFileSync(join(root, "packages/runtime-wasm32-wasi/runtime-pack.json"), "utf8"),
    ).flavors["library-thread-release"];
  } catch {
    return false;
  }
})();

class Cdp {
  private serial = 0;
  private pending = new Map<
    number,
    {
      resolve: (value: any) => void;
      reject: (error: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  constructor(private socket: WebSocket) {
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)),
        pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timer);
      if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
      else pending.resolve(message.result);
    });
    socket.addEventListener("close", () => {
      for (const p of this.pending.values()) {
        clearTimeout(p.timer);
        p.reject(new Error("browser debugger closed"));
      }
      this.pending.clear();
    });
  }
  async send(method: string, params: object = {}, sessionId?: string): Promise<any> {
    const id = ++this.serial;
    const result = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("browser debugger request timed out: " + method));
      }, 20000);
      this.pending.set(id, { resolve, reject, timer });
    });
    this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return result;
  }
  close() {
    this.socket.close();
  }
}

const controller = `
import {createRuntime} from './shared.mjs';
import {createRuntime as scalarRuntime} from './scalar.mjs';
self.onmessage=async()=>{
 let runtime;
 try{
  const bytes=await(await fetch(new URL('./shared.wasm',import.meta.url))).arrayBuffer();
  const scalarBytes=await(await fetch(new URL('./scalar.wasm',import.meta.url))).arrayBuffer();
  let fallbackReason=null;
  runtime=await createRuntime(bytes,{}, {workers:2,startupTimeoutMs:5000,fallback:reason=>{fallbackReason=reason;return scalarRuntime(scalarBytes);}});
  const buffer=runtime.buffer(8);buffer.writeFloat32(new Float32Array([1,2,3,4,5,6,7,8]));
  const counters=await Promise.all([runtime.call('run',[buffer,0,4,10]),runtime.call('run',[buffer,4,8,20])]);
  const states=await Promise.all([runtime.call('state',[]),runtime.call('state',[])]);
  const values=Array.from(buffer.readFloat32()),sum=await runtime.call('sum',[buffer]);
  const readOnlySums=await Promise.all([runtime.call('readOnlySum',[buffer]),runtime.call('readOnlySum',[buffer])]);buffer.release();
  const text=await runtime.call('text',['é\\0']);
  const cstring=await runtime.call('cstring',['hello']);
  const returned=Array.from(await runtime.call('bytes',[new Uint8Array([0,127,128,255])]));
  const negativeZero=Object.is(await runtime.call('echo',[-0]),-0);
  const nan=Number.isNaN(await runtime.call('echo',[NaN]));
  const randomOkay=await runtime.call('randomOkay',[]);
  const result={crossOriginIsolated:self.crossOriginIsolated,capabilities:runtime.capabilities,fallbackReason,counters,states,values,sum,readOnlySums,text,cstring,returned,negativeZero,nan,randomOkay};
  await runtime.close();runtime=null;self.postMessage(result);
 }catch(error){self.postMessage({error:String(error)});}
 finally{if(runtime)await runtime.close();}
};
`;

test.runIf(!!chromium && threaded)(
  "isolated browser Workers run real pthreads; unisolated pages select scalar reactors",
  async () => {
    const directory = await mkdtemp(join(tmpdir(), "scriptc-shared-browser-"));
    let browser: ReturnType<typeof spawn> | undefined, cdp: Cdp | undefined;
    const allowed = new Set([
      "controller.mjs",
      "shared.mjs",
      "shared.wasm",
      "scalar.mjs",
      "scalar.wasm",
    ]);
    const server = createServer(async (request, response) => {
      try {
        const path = new URL(request.url!, "http://localhost").pathname;
        if (path.startsWith("/isolated/")) {
          response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          response.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          response.setHeader("Cross-Origin-Resource-Policy", "same-origin");
        }
        response.setHeader("Cache-Control", "no-store");
        const name = path.split("/").at(-1)!;
        if (name === "index.html") {
          response.setHeader("Content-Type", "text/html");
          response.end("<!doctype html><title>Wasm pthread test</title>");
          return;
        }
        if (!allowed.has(name)) {
          response.writeHead(404);
          response.end();
          return;
        }
        response.setHeader(
          "Content-Type",
          name.endsWith(".wasm") ? "application/wasm" : "text/javascript",
        );
        response.end(await readFile(join(directory, name)));
      } catch (error) {
        response.writeHead(500);
        response.end(String(error));
      }
    });
    try {
      const oldTarget = process.env.SCRIPTC_TARGET;
      try {
        process.env.SCRIPTC_TARGET = "wasm32-wasi";
        const fixture = join(root, "tests/library-mode/shared-f32-jobs");
        for (const shared of [true, false]) {
          const name = shared ? "shared" : "scalar",
            profile = JSON.parse(await readFile(join(fixture, "profile.json"), "utf8"));
          profile.entry = join(fixture, "lib.ts");
          profile.abi.instance_per_thread = shared;
          profile.abi.wasm_memory.shared = shared;
          profile.abi.wasm_features = shared ? ["simd128"] : [];
          const profilePath = join(directory, name + ".json");
          await writeFile(profilePath, JSON.stringify(profile));
          const built = await compileLibrary({
            profilePath,
            outDir: directory,
            outPath: join(directory, name + ".wasm"),
          });
          if (!built.ok) throw new Error(JSON.stringify(built.diagnostics));
        }
      } finally {
        if (oldTarget === undefined) delete process.env.SCRIPTC_TARGET;
        else process.env.SCRIPTC_TARGET = oldTarget;
      }
      await writeFile(join(directory, "controller.mjs"), controller);
      await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("no test server port");
      browser = spawn(
        chromium!,
        [
          "--headless=new",
          "--disable-gpu",
          "--no-sandbox",
          "--no-first-run",
          "--no-default-browser-check",
          "--remote-debugging-port=0",
          "--user-data-dir=" + join(directory, "chrome"),
        ],
        { stdio: "ignore" },
      );
      let launchError: Error | undefined;
      browser.on("error", (error) => {
        launchError = error;
      });
      let portFile = "";
      for (let i = 0; i < 200; i++) {
        if (launchError) throw launchError;
        if (browser.exitCode !== null)
          throw new Error("Chromium exited before opening its debugger");
        try {
          portFile = await readFile(join(directory, "chrome/DevToolsActivePort"), "utf8");
          break;
        } catch {
          await delay(50);
        }
      }
      if (!portFile) throw new Error("Chromium debugger startup timed out");
      const [port, path] = portFile.trim().split("\n");
      const socket = new WebSocket("ws://127.0.0.1:" + port + path);
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Chromium debugger connection timed out")),
          10000,
        );
        socket.addEventListener(
          "open",
          () => {
            clearTimeout(timer);
            resolve();
          },
          { once: true },
        );
        socket.addEventListener(
          "error",
          () => {
            clearTimeout(timer);
            reject(new Error("cannot connect to Chromium"));
          },
          { once: true },
        );
      });
      cdp = new Cdp(socket);
      const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
      await cdp.send("Page.enable", {}, sessionId);
      for (const mode of ["isolated", "plain"]) {
        const url = "http://127.0.0.1:" + address.port + "/" + mode + "/index.html";
        await cdp.send("Page.navigate", { url }, sessionId);
        let loaded = false;
        for (let i = 0; i < 200; i++) {
          const result = await cdp.send(
            "Runtime.evaluate",
            {
              expression:
                "location.href === " +
                JSON.stringify(url) +
                " && document.readyState === 'complete'",
              returnByValue: true,
            },
            sessionId,
          );
          if (result.result.value) {
            loaded = true;
            break;
          }
          await delay(25);
        }
        if (!loaded) throw new Error("test page did not load");
        const evaluated = await cdp.send(
          "Runtime.evaluate",
          {
            expression: `new Promise((resolve,reject)=>{const worker=new Worker(new URL('controller.mjs',location.href),{type:'module'});const timer=setTimeout(()=>{worker.terminate();reject(new Error('browser worker timeout'));},15000);worker.onmessage=e=>{clearTimeout(timer);worker.terminate();resolve(e.data);};worker.onerror=e=>{clearTimeout(timer);worker.terminate();reject(new Error(e.message));};worker.postMessage(null);})`,
            awaitPromise: true,
            returnByValue: true,
          },
          sessionId,
        );
        if (evaluated.exceptionDetails) throw new Error(JSON.stringify(evaluated.exceptionDetails));
        const result = evaluated.result.value;
        expect(result.error).toBeUndefined();
        expect(result.values).toEqual([11, 12, 13, 14, 25, 26, 27, 28]);
        expect(result.sum).toBe(156);
        expect(result.readOnlySums).toEqual([156, 156]);
        expect(result.text).toBe("é\0λ\0😀");
        expect(result.cstring).toBe("hello✓");
        expect(result.returned).toEqual([0, 127, 128, 255]);
        expect(result.negativeZero).toBe(true);
        expect(result.nan).toBe(true);
        expect(result.randomOkay).toBe(1);
        expect(result.crossOriginIsolated).toBe(mode === "isolated");
        expect(result.capabilities.sharedMemory).toBe(mode === "isolated");
        expect(result.counters).toEqual(mode === "isolated" ? [1, 1] : [1, 2]);
        expect(result.states).toEqual(mode === "isolated" ? [1111, 1111] : [1111, 2222]);
        if (mode === "plain") expect(result.fallbackReason).toContain("isolation");
        else {
          const main = await cdp.send(
            "Runtime.evaluate",
            {
              expression: `(async()=>{const m=await import('./shared.mjs');try{await m.createRuntime(new Uint8Array());return 'unexpected';}catch(e){return String(e);}})()`,
              awaitPromise: true,
              returnByValue: true,
            },
            sessionId,
          );
          expect(main.result.value).toContain("dedicated Worker");
        }
      }
    } finally {
      cdp?.close();
      if (browser?.pid && browser.exitCode === null) {
        const exited = new Promise<void>((resolve) => browser!.once("exit", () => resolve()));
        browser.kill("SIGTERM");
        await Promise.race([exited, delay(3000)]);
        if (browser.exitCode === null) {
          browser.kill("SIGKILL");
          await exited;
        }
      }
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await rm(directory, { recursive: true, force: true });
    }
  },
  120000,
);
