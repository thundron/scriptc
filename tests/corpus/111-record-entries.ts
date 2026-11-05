const defaults = { strict: true };
const forced = { target: 99, lib: ["lib.es2025.d.ts"], types: [] as string[], allowJs: true };
function serialize(options: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(options)) {
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}
const options = { ...defaults, ...forced };
console.log(JSON.stringify(serialize(options)));
console.log(JSON.stringify(serialize({ ...forced })));
const base = { value: 1 };
const boxed: unknown = base;
(boxed as { value: number }).value = 2;
console.log(base.value);
const writable: any = base;
writable.value = 3;
console.log(base.value, writable === base);
const extra: any = { value: 4 };
extra.added = { value: 5 };
console.log(extra.added.value, JSON.stringify(Object.keys(extra)));
extra.value = 7;
console.log(extra.value, extra.added.value);
console.log(JSON.stringify(Object.assign({}, ...[{ left: 1 }, { right: 2 }], { end: 3 })));
