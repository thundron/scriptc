function entries(map) {
  for (const [, value] of map) console.log(value);
  for (const entry of map) console.log(entry[0], entry[1]);
  for (const [key, value = 4] of map) console.log(key, value);
}
entries(new Map([["a", 1], ["b", 2]]));
