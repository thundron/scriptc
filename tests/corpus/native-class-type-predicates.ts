class Opaque {
  entries: Map<string, number> = new Map();
  self: Opaque | null = null;
}
function inspect(value: unknown): void {
  console.log(typeof value, typeof value === 'object', typeof value === 'function', Array.isArray(value));
}
const value = new Opaque();
value.self = value;
inspect(value);
inspect([value]);
inspect(null);
inspect(1);
inspect('text');
value.self = null;
