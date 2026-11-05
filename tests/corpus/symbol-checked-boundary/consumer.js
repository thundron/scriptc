import assert from "node:assert/strict";

export function inspect(first, second, shared, store) {
  console.log(typeof first, Boolean(first), first === second, first === first);
  console.log(String(first), first.toString(), first.description, first.valueOf() === first);
  console.log(store.get(first), store.get(second), store.get(shared));
  store.set(first, "updated");
  console.log(store.size, store.has(first), store.has(second));
  assert.strictEqual(first, first);
  assert.deepStrictEqual(first, first);
  assert.notStrictEqual(first, second);
  assert.notDeepStrictEqual(first, second);
  console.log(JSON.stringify([first]), JSON.stringify({ value: first }));
  try { console.log("value=" + first); } catch (error) { console.log(error.name, error.message); }
  try { console.log(`${first}`); } catch (error) { console.log(error.name, error.message); }
  try { console.log(Number(first)); } catch (error) { console.log(error.name, error.message); }
  try { structuredClone(first); } catch (error) { console.log(error.name, error.message); }
  return first;
}
