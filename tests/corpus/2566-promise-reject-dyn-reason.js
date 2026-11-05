// Promise.reject with a CHECKED-DYNAMIC reason (`Promise.reject(value)`
// where value rode an untyped JS param — the tracingChannel promise
// suite's shape): the dyn value is the rejection payload. Every reason kind rides the thrown-dyn representation into
// catch/await observers, settled-state choreography intact (the .catch
// callbacks run as microtasks after the synchronous tail). The LLVM tier
// used to crash the CLI on the non-object-kinded reason type; now it
// emits the scr_throw_ref representation for the dynamic value.
// Node is the oracle byte-for-byte.
"use strict";

function reject(value) {
  return Promise.reject(value);
}

reject(new Error("boom")).catch(() => {
  console.log("caught error reason");
});
reject("str-reason").catch(() => {
  console.log("caught string reason");
});
reject(42).catch(() => {
  console.log("caught number reason");
});
reject({ code: 1 }).catch(() => {
  console.log("caught object reason");
});

async function viaAwait(value) {
  try {
    await reject(value);
    console.log("unreachable");
  } catch {
    console.log("await caught");
  }
}
viaAwait(new Error("later"));

console.log("sync end");
