console.log(typeof process, "hrtime" in process, typeof process.hrtime, typeof process.hrtime.bigint);
const hrtime = process.hrtime;
console.log(hrtime === process.hrtime, hrtime.bigint === process.hrtime.bigint);
const start = hrtime();
const elapsed = hrtime(start);
console.log(Array.isArray(start), start.length, start[0] >= 0, start[1] >= 0 && start[1] < 1e9);
console.log(elapsed[0] >= 0, elapsed[1] >= 0 && elapsed[1] < 1e9);
const bigint = process.hrtime.bigint;
const before = bigint();
const after = bigint();
console.log(typeof before, before > 0n, after >= before);
const guarded = typeof process === "object" && "hrtime" in process && typeof process.hrtime.bigint === "function" ? process.hrtime : undefined;
console.log(typeof guarded.bigint(), guarded === hrtime);
for (const value of [null, {}, 1, "x", [], [1], [1, 2, 3], [0n, 0], [0, 0n]]) {
  try { hrtime(value); } catch (error) { console.log(error.name, error.code, error.message); }
}
const holes = hrtime([undefined, undefined]);
console.log(Number.isNaN(holes[0]), Number.isNaN(holes[1]));
const direct = process.hrtime();
console.log(typeof process.hrtime.bigint(), direct.length);
