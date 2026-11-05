// npm-static pilot: the real ms package (vendored) compiled STATICALLY —
// its JSDoc'd CJS body typed by inference, no island. BOTH directions are
// driven and byte-compared with Node now: the number direction (format)
// and the string direction (parse), the latter unblocked by aliased-typeof
// narrowing (`var type = typeof val` — the checker only narrows const
// aliases), static regex exec, parseFloat, isFinite, and Math.abs/round.
import ms from "ms";

// The string direction (parse).
console.log(`${ms("2 days")}`);
console.log(`${ms("1d")}`);
console.log(`${ms("10h")}`);
console.log(`${ms("2.5 hrs")}`);
console.log(`${ms("2h")}`);
console.log(`${ms("1m")}`);
console.log(`${ms("5s")}`);
console.log(`${ms("1y")}`);
console.log(`${ms("100")}`);
console.log(`${ms("-3 days")}`);
console.log(`${ms("-1h")}`);
console.log(`${ms("-200")}`);
console.log(`${ms("1.5H")}`);
console.log(`${ms(".5ms")}`);
console.log(`${ms("60000")}`);

// The number direction (format).
console.log(`${ms(60000)}`);
console.log(`${ms(2 * 60000)}`);
console.log(`${ms(-3 * 60000)}`);
console.log(`${ms(500)}`);
console.log(`${ms(10 * 1000)}`);
console.log(`${ms(3 * 3600 * 1000)}`);
console.log(`${ms(2.5 * 86400 * 1000)}`);
console.log(`${ms(60001, { long: true })}`);
console.log(`${ms(1, { long: true })}`);
console.log(`${ms(86400000 * 3, { long: true })}`);
console.log(`${ms(5500, { long: true })}`);
