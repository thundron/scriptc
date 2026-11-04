export {};
const source: unknown = Promise.resolve(42);
const recovered = source as Promise<unknown>;
console.log(recovered === (source as Promise<unknown>), await recovered);
function optional(value: unknown): Promise<unknown> | undefined {
  return value as Promise<unknown> | undefined;
}
const present = optional(source);
if (present !== undefined) console.log(optional(undefined) === undefined, await present);
const rejected: unknown = Promise.reject("failure");
try { await (rejected as Promise<unknown>); }
catch (error) { console.log(error); }
