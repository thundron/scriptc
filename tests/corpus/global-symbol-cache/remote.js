const key = Symbol.for("scriptc.cache");
export function remoteRead() { return globalThis[key]; }
export function remoteClear() { delete globalThis[key]; }
