class Item { value = 42; }
const key = Symbol.for("checked-record-constructor");
function check(value: unknown): { constructor: typeof Item; key: symbol } {
  return value as { constructor: typeof Item; key: symbol };
}
const record = check({ constructor: Item, key });
console.log(new record.constructor().value, record.key === key);
try { new (check({ constructor: 3, key }).constructor)(); } catch (error) { console.log((error as Error).name); }
try { Symbol.keyFor(check({ constructor: Item, key: "wrong" }).key); } catch (error) { console.log((error as Error).name); }
