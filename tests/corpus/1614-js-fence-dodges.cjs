// Unsupported JS statements remain deferred behind untaken branches.
// Both bigint and number table arms now have native checked storage;
// the Proxy expression also has native checked storage.
'use strict';

function platformScale(ms) {
  const multipliers = typeof ms === 'bigint' ? { two: 2n, four: 4n } : { two: 2, four: 4 };
  if (globalThis['__scriptc_absent__'] !== undefined) {
    return new Proxy(multipliers, {}).two * ms; // untaken: dynamic-global probes answer undefined
  }
  return ms;
}
console.log('F1', platformScale(4000) === 4000);

// Identity tokens: stdlib global function values participate in identity
// flows (the harness's knownGlobals idiom) — one global, one token.
const known = new Set([setTimeout, clearTimeout, setInterval]);
console.log('F2', known.has(setTimeout), known.has(clearInterval));

// WeakMap constructs natively; this case only observes identity
// that never fire here.
const wm = new WeakMap();
console.log('F3', wm !== null);

// for-in over globalThis: nothing a compiled program can leak — the body
// observes no scriptc-created enumerable globals (Node's own baseline
// names are all outside this program's output).
let sawOwnLeak = false;
for (const k in globalThis) {
  if (k === '__scriptc_leak__') sawOwnLeak = true;
}
console.log('F4', sawOwnLeak);
