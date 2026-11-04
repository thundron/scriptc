async function main() {
  for await (const [value = 10, nullValue = 11, hole = 12, explicit = 13, missing = 14] of [[2, null, , undefined]]) {
    console.log(value, nullValue, hole, explicit, missing);
  }

  const items = [[3, null, undefined], [4, 5, 6]];
  for (const [first = 8, second = 9, third = 10] of items) {
    console.log(first, second, third);
  }
}

main();
