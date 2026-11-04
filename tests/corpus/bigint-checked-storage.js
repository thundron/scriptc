function identity(value) { return value; }
const big = identity(18446744073709551615n);
const zero = identity(0n);
const negative = identity(-9223372036854775808n);
console.log(typeof big, String(big), Boolean(big), Boolean(zero));
console.log(big === identity(18446744073709551615n), big === identity(18446744073709551615));
console.log(String(big + identity(1n)), String(negative + identity(-1n)), big + "!");
const record = { pointer: big, nested: [negative, zero] };
console.log(record.pointer.toString(16), record.nested.map(value => String(value)).join(","));
console.log(String(structuredClone(record).pointer));
console.log(Object.fromEntries([[big, "pointer"]])["18446744073709551615"]);
for (const value of [big, [big], { value: big }]) {
  try { console.log(JSON.stringify(value)); } catch (error) { console.log(error.name, error.message); }
}
console.log(JSON.stringify(record, (_key, value) => typeof value === "bigint" ? String(value) : value));
for (const other of [1, null, undefined, true]) {
  try { console.log(big + other); } catch (error) { console.log(error.name, error.message); }
}
console.log(Object.prototype.toString.call(big), Number(identity(42n)));
try { new WeakMap().set(big, 1); } catch (error) { console.log(error.name, error.message); }
const values = new Map([[big, "first"], [identity(18446744073709551615n), "second"]]);
console.log(values.size, values.get(identity(18446744073709551615n)));
console.log([big].includes(identity(18446744073709551615n)), [big].indexOf(identity(18446744073709551615n)));
console.log(Number({ valueOf() { return identity(42n); } }));
for (const radix of [2, 10, 36, undefined, 1, 37, null, 2n]) {
  try { console.log(big.toString(radix)); } catch (error) { console.log(error.name, error.message); }
}
try { console.log(+big); } catch (error) { console.log(error.name, error.message); }
try { new Map([big]); } catch (error) { console.log(error.name, error.message); }
function describe(value) { return typeof value === "bigint" ? value.toString(16) : "other"; }
console.log(describe(big), describe(1), describe(null));
const buffer = identity(Buffer.from([65, 255]));
for (const encoding of ["HEX", "latin1", "utf8", "invalid", undefined, null, 0, 16]) {
  try { console.log(buffer.toString(encoding)); } catch (error) { console.log(error.name, error.message); }
}
console.log(identity(Buffer.from([])).toString("invalid"));
