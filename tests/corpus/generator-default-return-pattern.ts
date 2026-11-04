function* records(): Generator<{ name: string; value: number }> {
  yield { name: "first", value: 21 };
  yield { name: "second", value: 42 };
  return "done";
}
for (const { name, value } of records()) console.log(name, value);
const iterator = records();
console.log(iterator.next().value, iterator.next().value, iterator.next().value);

async function* pairs(): AsyncGenerator<[string, number]> {
  yield ["pair", 7];
  return true;
}
async function run() {
  for await (const [name, value] of pairs()) console.log(name, value);
}
run();
