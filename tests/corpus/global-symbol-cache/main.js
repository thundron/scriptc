import { remoteRead, remoteClear } from "./remote.js";
const cacheKey = Symbol.for("scriptc.cache");
function singleton(key, factory) {
  const bag = globalThis[cacheKey] ??= {};
  if (!(key in bag)) bag[key] = factory();
  return bag[key];
}
let made = 0;
function make() { made++; return { value: made }; }
const first = singleton("item", make);
const second = singleton("item", make);
console.log(first === second, first.value, made);
const sameKey = Symbol.for("scriptc.cache");
console.log(globalThis[cacheKey] === globalThis[sameKey], cacheKey in globalThis, remoteRead() === globalThis[cacheKey]);
const unique = Symbol("scriptc.cache");
console.log(globalThis[unique] === undefined, unique in globalThis);
globalThis[unique] = undefined;
console.log(globalThis[unique] === undefined, unique in globalThis);
delete globalThis[unique];
console.log(unique in globalThis);
remoteClear();
console.log(globalThis[sameKey] === undefined, sameKey in globalThis);
const replacement = singleton("item", make);
console.log(replacement === first, replacement.value, made);
let reads = 0;
function key() { reads++; return cacheKey; }
const again = globalThis[key()] ??= { unused: true };
console.log(reads, again === globalThis[cacheKey]);
delete globalThis[cacheKey];
