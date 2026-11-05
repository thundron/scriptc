// Supported collection forms stay beside their remaining refusal boundaries.
const m = new Map<string, number>();

// Entry-seeded construction lowers for an array literal of pair literals
// at the construction site and for [K, V][]-typed tuple-array values;
// another Map can also seed construction.
const seeded = new Map(m);

// Stored keys()/values()/entries() iterators compile natively.
const ks = m.keys();
const vs = m.values();
const es = m.entries();

// Map spreads also compile.
const spread = [...m];

// set() returns the same Map, so chained mutations compile.
m.set("a", 1).set("b", 2);

// The forEach callback receives (value, key) — no third map parameter.
m.forEach((v, k, theMap) => console.log(k, v));
// The unsupported callback must produce a diagnostic.
