import type { WasmGlueModule } from "./wasm-glue.js";

/** Emit only for an explicit memory ABI. Ordinary reactors keep their old glue. */
export function emitManagedWasmRuntime(mod: WasmGlueModule): string {
  if (mod.memory === undefined) return "";
  const config = {
    ...mod.memory,
    init: mod.initSymbol ?? null,
    simd: mod.features?.includes("simd128") === true,
    callbacks: mod.imports.length,
    methods: mod.managedExports ?? mod.exports.map((e) => ({ name: e.name, symbol: e.name })),
  };
  return `
const __managedConfig = ${JSON.stringify(config)};
const __managedMethods = new Map(__managedConfig.methods.map(m => [m.name, m.symbol]));
const __mailboxBytes = 65536;
const __mailboxHeader = 8;
const __threadsProbe = new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]);
const __simdProbe = new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,23,1,21,0,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26,11]);
function __wireEncode(value, depth = 0, replace = null, budget = {left:__mailboxBytes}) {
  if (replace !== null) value=replace(value);
  budget.left -= typeof value === "string" ? value.length+1 : value instanceof Uint8Array ? value.length+1 : 1;
  if (budget.left < 0) throw new RangeError("wasm job exceeds its control-message budget");
  if (depth > 16) throw new RangeError("wasm job arguments exceed the nesting limit");
  if (value === undefined) return ["undefined"];
  if (value === null || typeof value === "boolean" || typeof value === "string") return value;
  if (typeof value === "number") return Number.isFinite(value) && !Object.is(value,-0) ? value : ["number",String(value),Object.is(value,-0)];
  if (typeof value === "bigint") return ["bigint",String(value)];
  if (value instanceof Uint8Array) return ["bytes",Array.from(value)];
  if (Array.isArray(value)) {
    if (value.length > budget.left) throw new RangeError("wasm job exceeds its control-message budget");
    return ["array",value.map(v => __wireEncode(v,depth+1,replace,budget))];
  }
  throw new TypeError("wasm jobs accept only ABI scalars, bytes and arrays");
}
function __wireDecode(value) {
  if (!Array.isArray(value)) return value;
  switch (value[0]) {
    case "undefined": return undefined;
    case "number": return value[2] ? -0 : Number(value[1]);
    case "bigint": return BigInt(value[1]);
    case "bytes": return new Uint8Array(value[1]);
    case "array": return value[1].map(__wireDecode);
    default: throw new Error("invalid wasm job value tag");
  }
}
function __jobBytes(value) {
  const bytes = te.encode(JSON.stringify(value));
  if (bytes.length > __mailboxBytes) throw new RangeError("wasm job exceeds the 64KiB control-message limit; use a shared buffer handle for bulk data");
  return bytes;
}
function __integerOption(value, fallback, min, max, name) {
  const n = value === undefined ? fallback : value;
  if (!Number.isSafeInteger(n) || n < min || n > max) throw new RangeError(name + " is outside its supported range");
  return n;
}
function __newMailbox() { return new Int32Array(new SharedArrayBuffer(__mailboxHeader*4 + __mailboxBytes)); }
function __mailboxWrite(control, bytes) {
  new Uint8Array(control.buffer,__mailboxHeader*4,bytes.length).set(bytes);
  Atomics.store(control,1,bytes.length);
  Atomics.store(control,0,1);
  Atomics.notify(control,0);
}
function __mailboxRead(control) {
  const n = Atomics.load(control,1);
  if (n < 0 || n > __mailboxBytes) throw new Error("invalid wasm job mailbox length");
  return JSON.parse(td.decode(new Uint8Array(control.buffer,__mailboxHeader*4,n).slice()));
}
function __deferred() {
  let resolve, reject;
  const promise = new Promise((yes,no) => { resolve=yes; reject=no; });
  promise.catch(() => {});
  return {promise,resolve,reject};
}
function __managedImports(binding, memory, spawn, entry) {
  binding.importObject.env = {...binding.importObject.env,memory};
  binding.importObject.wasi = {...binding.importObject.wasi,"thread-spawn":spawn};
  binding.importObject["scriptc:threads"] = {worker_entry:entry};
}

/** A shared-memory runtime must live in Node or a dedicated browser Worker:
 * real libc pthread startup/join uses futexes, never browser-window blocking.
 * Missing isolation/SIMD can select a separately compiled scalar runtime. */
export async function createRuntime(bytes, host = {}, options = {}) {
  const cfg = __managedConfig;
  const node = typeof process !== "undefined" && !!process.versions?.node;
  const workerContext = typeof WorkerGlobalScope !== "undefined" && globalThis instanceof WorkerGlobalScope;
  let unavailable = null;
  if (cfg.simd && !WebAssembly.validate(__simdProbe)) unavailable = "WebAssembly SIMD128 is unavailable";
  if (cfg.shared && !WebAssembly.validate(__threadsProbe)) unavailable = "WebAssembly threads/atomics are unavailable";
  if (cfg.shared && !node && typeof Worker !== "function") unavailable = "nested Workers are unavailable";
  if (cfg.shared && (typeof SharedArrayBuffer !== "function" || (!node && globalThis.crossOriginIsolated !== true))) unavailable = "shared WebAssembly requires cross-origin isolation and SharedArrayBuffer";
  if (cfg.shared && !node && !workerContext) unavailable = "shared WebAssembly pthreads must be hosted in a dedicated Worker, not a browser window";
  if (unavailable !== null) {
    if (typeof options.fallback === "function") return options.fallback(unavailable);
    throw new Error(unavailable + "; use an independent-instance scalar build");
  }
  const count = cfg.shared ? __integerOption(options.workers,4,1,64,"workers") : 1;
  const timeoutMs = __integerOption(options.timeoutMs,30000,1,86400000,"timeoutMs");
  const startupMs = __integerOption(options.startupTimeoutMs,10000,1,120000,"startupTimeoutMs");
  const maxQueued = __integerOption(options.maxQueuedJobs,count*8,1,1024,"maxQueuedJobs");
  if (cfg.shared && cfg.callbacks && options.workerHostModule === undefined) throw new Error("threaded host callbacks require workerHostModule exporting createHost({slot,memory})");
  const workerHostModule = options.workerHostModule === undefined ? null : new URL(String(options.workerHostModule),import.meta.url).href;
  const module = bytes instanceof WebAssembly.Module ? bytes : await WebAssembly.compile(bytes);
  let memory;
  try { memory = new WebAssembly.Memory({initial:cfg.initialPages,maximum:cfg.maximumPages,shared:cfg.shared}); }
  catch (error) {
    if (cfg.shared && typeof options.fallback === "function") return options.fallback(String(error));
    throw error;
  }
  let WorkerConstructor = null;
  if (cfg.shared && node) ({Worker:WorkerConstructor} = await import("node:worker_threads"));
  let rootBinding = null, raw = null, api = null;
  let closed = false, closePromise = null, spawning = -1, serial = 0, rootBusy = false;
  let records = [];
  const queue = [], jobs = new Map(), buffers = new Set(), bufferObjects = new WeakMap();
  const closedError = () => new Error("wasm runtime is closed or poisoned");
  const check = () => { if (closed || raw === null) throw closedError(); };
  function rawCall(name,...args){
    check();
    try{return raw[name](...args);}catch(error){fatal(error);throw error;}
  }
  function settle(job, error, value) {
    if (!jobs.delete(job.id)) return;
    clearTimeout(job.timer);
    try{job.signal?.removeEventListener("abort",job.abort);}catch{}
    try{if (!closed) for (const lease of job.leases) rawCall("scriptc_shared_f32_release",lease);}
    catch(cleanupError){error=error??cleanupError;}
    if (error) job.reject(error); else job.resolve(value);
  }
  function releaseReferences() {
    raw=null;api=null;rootBinding=null;memory=null;buffers.clear();records=[];
  }
  function abandon(error) {
    closed=true;
    for (const job of jobs.values()) settle(job,error);
    queue.length=0;
    const current=records;
    for (const record of current) {record.booted.reject(error);record.ready.reject(error);record.stopped.reject(error);}
    releaseReferences();
    const terminate=Promise.all(current.map(record => Promise.resolve(record.terminate()).catch(() => {}))).then(() => {});
    if (closePromise === null) closePromise=terminate;
    return terminate;
  }
  function fatal(error) {
    if (!closed) void abandon(error instanceof Error ? error : new Error(String(error)));
  }
  function receive(record, message) {
    if (message?.protocol !== 1 || message.slot !== record.slot) {fatal(new Error("invalid wasm worker protocol"));return;}
    if (message.kind === "error") {
      const error=new Error("wasm worker " + record.slot + ": " + message.message);
      record.booted.reject(error);record.ready.reject(error);record.stopped.reject(error);fatal(error);return;
    }
    if (message.kind === "booted") {record.booted.resolve();return;}
    if (message.kind === "ready") {record.ready.resolve();return;}
    if (message.kind === "stopped") {record.stopped.resolve();if (!closed) fatal(new Error("wasm worker stopped unexpectedly"));return;}
    if (closed) return;
    const job=record.pending;
    if (message.kind !== "result" || !job || message.id !== job.id) {fatal(new Error("unexpected wasm worker result"));return;}
    let result;
    try {__jobBytes(message.value);result=__wireDecode(message.value);} catch (error) {fatal(error);return;}
    record.pending=null;
    settle(job,null,result);
    pump();
  }
  function openWorker(slot) {
    const control=__newMailbox();Atomics.store(control,0,-2);
    const record={slot,control,booted:__deferred(),ready:__deferred(),stopped:__deferred(),pending:null,terminate:()=>{}};
    records.push(record);
    const data={module,memory,control,slot,glue:import.meta.url,workerHostModule};
    const fail=error => {record.booted.reject(error);record.ready.reject(error);record.stopped.reject(error);fatal(error);};
    if (node) {
      const source="const {workerData,parentPort}=require('node:worker_threads');import(workerData.glue).then(m=>m.__startSharedWorker(workerData,v=>parentPort.postMessage(v))).then(()=>parentPort.close()).catch(e=>{Atomics.store(workerData.control,0,-3);Atomics.notify(workerData.control,0);parentPort.postMessage({protocol:1,slot:workerData.slot,kind:'error',message:String(e).slice(0,4096)});parentPort.close();});";
      const worker=new WorkerConstructor(source,{eval:true,workerData:data});
      record.terminate=() => worker.terminate();
      worker.on("message",message => receive(record,message));
      worker.on("error",fail);
      worker.on("exit",code => {if (!closed) fail(new Error("wasm worker exited unexpectedly ("+code+")"));});
    } else {
      const source="self.onmessage=async e=>{const d=e.data;try{const m=await import(d.glue);await m.__startSharedWorker(d,v=>self.postMessage(v));}catch(error){Atomics.store(d.control,0,-3);Atomics.notify(d.control,0);self.postMessage({protocol:1,slot:d.slot,kind:'error',message:String(error).slice(0,4096)});}finally{self.close();}};";
      const url=URL.createObjectURL(new Blob([source],{type:"text/javascript"}));
      let worker;
      try {worker=new Worker(url,{type:"module"});} catch (error) {URL.revokeObjectURL(url);throw error;}
      record.terminate=() => {worker.terminate();URL.revokeObjectURL(url);};
      worker.onmessage=event => receive(record,event.data);
      worker.onerror=event => fail(new Error(event.message || "wasm worker failed"));
      worker.postMessage(data);
    }
    return record;
  }
  function pump() {
    if (closed) return;
    if (!cfg.shared) {
      if (rootBusy || !queue.length) return;
      const job=queue.shift();rootBusy=true;
      queueMicrotask(() => {
        if (closed) {rootBusy=false;return;}
        try {const value=__wireEncode(api[__managedMethods.get(job.name)](...__wireDecode(job.args)));__jobBytes(value);settle(job,null,__wireDecode(value));}
        catch (error) {fatal(error);}
        finally {rootBusy=false;pump();}
      });
      return;
    }
    for (const record of records) {
      if (record.pending || !queue.length) continue;
      const job=queue.shift();record.pending=job;
      __mailboxWrite(record.control,job.bytes);
    }
  }
  try {
    rootBinding=bindHost({...host,panic(message){host.panic?.(message);throw new Error(message);}});
    __managedImports(rootBinding,memory,arg => {
      if (spawning < 0 || closed) return -1;
      const record=records.find(r=>r.slot===spawning),tid=spawning+2;
      if(!record || Atomics.load(record.control,0)!==0 || Atomics.load(record.control,2)!==0)
        throw new Error("pthread worker was not prewarmed");
      Atomics.store(record.control,3,tid);Atomics.store(record.control,4,arg);
      Atomics.store(record.control,2,1);Atomics.notify(record.control,2);
      return tid;
    },() => {throw new Error("pthread entry called on the controller instance");});
    const instance=await WebAssembly.instantiate(module,rootBinding.importObject);
    raw=instance.exports;
    api=rootBinding.finish(instance,false);
    if (cfg.shared && raw.scriptc_memory_claim() !== 0) throw new Error("shared memory already belongs to another runtime");
    raw._initialize?.();
    if (!cfg.shared && cfg.init !== null) raw[cfg.init]();
    // Browser Worker construction/module loading needs the creator's event
    // loop. Prewarm asynchronously before libc makes synchronous spawn calls.
    if(cfg.shared){
      for(let slot=0;slot<count;slot++)openWorker(slot);
      let timer;
      try{await Promise.race([Promise.all(records.map(r=>r.booted.promise)),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error("wasm pthread bootstrap failed or timed out")),startupMs);})]);}
      finally{clearTimeout(timer);}
      check();
    }
    if (cfg.shared) for (let slot=0;slot<count;slot++) {
      spawning=slot;
      const status=raw.scriptc_thread_spawn(slot,cfg.stackBytes);
      spawning=-1;
      if (status !== 0) throw new Error("real WASI pthread_create failed ("+status+")");
      const record=records.find(r => r.slot === slot);
      if (!record) throw new Error("pthread startup did not create its worker");
      let timer;
      try {await Promise.race([record.ready.promise,new Promise((_,reject) => {timer=setTimeout(() => reject(new Error("wasm thread initialization timed out")),startupMs);})]);}
      finally {clearTimeout(timer);}
      check();
    }
  } catch (error) {await abandon(error);throw error;}
  function allocateBuffer(length) {
    check();
    __integerOption(length,undefined,0,0x3fffffff,"buffer length");
    const handle=rawCall("scriptc_shared_f32_new",length);
    if (!handle) throw new RangeError("shared float32 allocation failed");
    const record={handle,length,released:false};buffers.add(record);
    function view(at,n,body) {
      check();
      if (record.released) throw new Error("shared buffer has been released");
      __integerOption(at,0,0,length,"buffer offset");
      __integerOption(n,length-at,0,length-at,"buffer span");
      const lease=rawCall("scriptc_shared_f32_retain",handle);
      if (!lease) throw new Error("invalid or stale shared buffer handle");
      const mem=memory;
      try {
        const address=rawCall("scriptc_shared_f32_data",lease)>>>0;
        const words=new Uint32Array(mem.buffer,address+at*4,n);
        return body(words);
      } finally {if (!closed) rawCall("scriptc_shared_f32_release",lease);}
    }
    const input=(values,kind) => {
      if (!(values instanceof kind)) throw new TypeError("buffer writes require an owned Float32Array or Uint32Array");
      return new kind(values);
    };
    const result = Object.freeze({
      handle,length,
      writeFloat32(values,at=0) {
        const copy=input(values,Float32Array),bits=new Uint32Array(copy.buffer);
        view(at,copy.length,words => {for(let i=0;i<bits.length;i++){if(cfg.shared)Atomics.store(words,i,bits[i]);else words[i]=bits[i];}});
      },
      readFloat32(at=0,n=length-at) {
        const out=new Float32Array(n),bits=new Uint32Array(out.buffer);
        view(at,n,words => {for(let i=0;i<n;i++)bits[i]=cfg.shared?Atomics.load(words,i):words[i];});return out;
      },
      writeUint32(values,at=0) {
        const copy=input(values,Uint32Array);
        view(at,copy.length,words => {for(let i=0;i<copy.length;i++){if(cfg.shared)Atomics.store(words,i,copy[i]);else words[i]=copy[i];}});
      },
      readUint32(at=0,n=length-at) {
        const out=new Uint32Array(n);
        view(at,n,words => {for(let i=0;i<n;i++)out[i]=cfg.shared?Atomics.load(words,i):words[i];});return out;
      },
      release() {
        check();if(record.released)throw new Error("shared buffer has already been released");
        record.released=true;buffers.delete(record);
        if(rawCall("scriptc_shared_f32_release",handle)!==0)throw new Error("invalid or stale shared buffer handle");
      },
    });
    bufferObjects.set(result,record);
    return result;
  }
  function call(name,args=[],jobOptions={}) {
    return new Promise((resolve,reject) => {
      const leases=[];
      let job=null;
      try {
        check();
        if (!__managedMethods.has(name) || !Array.isArray(args)) throw new TypeError("unknown wasm export or invalid argument list");
        if (queue.length >= maxQueued) throw new RangeError("wasm worker queue is full");
        if (serial === Number.MAX_SAFE_INTEGER) throw new Error("wasm job sequence exhausted");
        const duration=__integerOption(jobOptions.timeoutMs,timeoutMs,1,86400000,"job timeoutMs");
        const signal=jobOptions.signal;
        if(signal!==undefined && (!signal || typeof signal.aborted!=="boolean" || typeof signal.addEventListener!=="function" || typeof signal.removeEventListener!=="function"))throw new TypeError("job signal must be an AbortSignal");
        const encoded=__wireEncode(args,0,value => {
          if (typeof value !== "object" || value === null || !bufferObjects.has(value)) return value;
          const record=bufferObjects.get(value);
          check();
          if(record.released)throw new Error("shared buffer has been released");
          const lease=rawCall("scriptc_shared_f32_retain",record.handle);
          if(!lease)throw new Error("invalid or stale shared buffer handle");
          leases.push(lease);return lease;
        }),id=++serial;
        const bytes=__jobBytes({id,name,args:encoded});
        check();
        if(signal?.aborted)throw new Error("wasm job aborted before dispatch");
        job={id,name,args:encoded,bytes,leases,resolve,reject,signal,timer:null,abort:null};
        job.abort=() => fatal(new Error("wasm job aborted; the shared runtime was discarded"));
        job.timer=setTimeout(() => fatal(new Error("wasm job timed out; the shared runtime was discarded")),duration);
        jobs.set(id,job);
        job.signal?.addEventListener("abort",job.abort,{once:true});
        if(!closed && jobs.has(id)){queue.push(job);pump();}
      } catch(error) {
        if(job && jobs.has(job.id))settle(job,error);
        else {if(!closed)for(const lease of leases)rawCall("scriptc_shared_f32_release",lease);reject(error);}
      }
    });
  }
  function close() {
    if(closePromise!==null)return closePromise;
    if(closed)return Promise.resolve();
    if(jobs.size || rootBusy)return abandon(new Error("wasm runtime closed with pending jobs"));
    closed=true;
    closePromise=(async () => {
      const current=records;
      let graceful=true,timer;
      try {
        for(const record of current){Atomics.store(record.control,0,-1);Atomics.notify(record.control,0);}
        if(cfg.shared) await Promise.race([Promise.all(current.map(r=>r.stopped.promise)),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error("wasm worker shutdown timed out")),startupMs);})]);
        for(const record of current)if(raw.scriptc_thread_join(record.slot)!==0)throw new Error("WASI pthread_join failed");
        for(const record of buffers){raw.scriptc_shared_f32_release(record.handle);record.released=true;}
        // The shared controller owns only neutral backing allocations; it
        // never initialized a source-language GC context.
      } catch {graceful=false;}
      finally {
        clearTimeout(timer);
        releaseReferences();
        await Promise.all(current.map(r=>Promise.resolve(r.terminate()).catch(()=>{})));
      }
      if(!graceful)throw new Error("wasm runtime shutdown failed; its memory was discarded");
    })();
    return closePromise;
  }
  return Object.freeze({
    capabilities:Object.freeze({mode:cfg.shared?"threads":"scalar",sharedMemory:cfg.shared,simd:cfg.simd,workers:cfg.shared?count:0}),
    get memoryBytes(){return memory?.buffer.byteLength ?? 0;},
    call,buffer:allocateBuffer,close,
  });
}

/** Internal bootstrap entry, deliberately shared by Node and browser Workers.
 * C's real wasi_thread_start establishes the pthread TLS/stack before any
 * program initialization, job, or context disposal enters that instance. */
export async function __startSharedWorker(data,send) {
  const cfg=__managedConfig,control=data.control;
  if(!cfg.shared)throw new Error("this module does not declare a shared-memory ABI");
  const post=message=>send({protocol:1,slot:data.slot,...message});
  let instance,api;
  const host=data.workerHostModule===null?{}:await (await import(data.workerHostModule)).createHost({slot:data.slot,memory:data.memory});
  const binding=bindHost({...host,panic(message){host.panic?.(message);throw new Error(message);}});
  __managedImports(binding,data.memory,()=>-1,slot=>{
    if(slot!==data.slot)throw new Error("pthread worker slot mismatch");
    if(cfg.init!==null)instance.exports[cfg.init]();
    Atomics.store(control,0,0);post({kind:"ready"});
    for(;;){
      const state=Atomics.load(control,0);
      if(state===-1)break;
      if(state===0){Atomics.wait(control,0,0);continue;}
      if(state!==1)throw new Error("invalid wasm job mailbox state");
      const job=__mailboxRead(control);
      if(!__managedMethods.has(job.name)||!Number.isSafeInteger(job.id))throw new Error("invalid wasm job header");
      Atomics.store(control,0,2);
      const value=__wireEncode(api[__managedMethods.get(job.name)](...__wireDecode(job.args)));
      __jobBytes(value);
      Atomics.store(control,0,0);
      post({kind:"result",id:job.id,value});
    }
    instance.exports.scriptc_thread_dispose();
  });
  try {
    instance=await WebAssembly.instantiate(data.module,binding.importObject);
    api=binding.finish(instance,false);
    // Module loading/instantiation finishes before the controller can enter
    // libc. Only the preallocated pthread's start record crosses afterwards.
    Atomics.store(control,0,0);post({kind:"booted"});
    while(Atomics.load(control,2)===0)Atomics.wait(control,2,0);
    if(Atomics.load(control,2)!==1)throw new Error("invalid pthread start state");
    instance.exports.wasi_thread_start(Atomics.load(control,3),Atomics.load(control,4));
    post({kind:"stopped"});
  }catch(error){Atomics.store(control,0,-3);Atomics.notify(control,0);post({kind:"error",message:String(error).slice(0,4096)});}
}
`;
}
