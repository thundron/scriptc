function identity(value) { return value; }
function make() { return { values: new Set() }; }
const state = identity(make());
const values = state.values;
console.log(values.add(18446744073709551615n) === values, values.size);
values.add(0n).add(1).add("one");
console.log(values.has(18446744073709551615n), values.delete(0n), values.has(0n));
const visited = [];
values.forEach((value, duplicate, owner) => {
  visited.push(String(value) + ":" + (value === duplicate) + ":" + (owner === values));
  if (value === 1) { values.delete("one"); values.add(2); }
});
console.log(visited.join(","), values.size);
values.clear();
console.log(values.size);

for (const callback of [undefined, null, 1, "x", {}, 1n, false]) {
  try { values.forEach(callback); } catch (error) { console.log(error.name, error.message); }
}
values.add(1).add(2);
values.forEach(function (value) { console.log(this.label, value); }, { label: "owner" });
try { values.forEach(() => { throw new Error("stop"); }); } catch (error) { console.log(error.message); }
const cleared = [];
values.forEach((value) => {
  cleared.push(value);
  if (value === 1) { values.clear(); values.add(3); }
});
console.log(cleared.join(","), values.size, values instanceof Set);
