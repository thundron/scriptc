function roundtrip(text, options) {
  const value = JSON.parse(text, options?.reviver);
  return JSON.stringify(value, options?.replacer, options?.space);
}
console.log(roundtrip('{"n":42}'));
console.log(roundtrip('{"n":42}', { reviver: null, replacer: null, space: 2 }));
console.log(roundtrip('{"n":42}', {
  reviver(key, value) { return key === "n" ? value + 1 : value; },
  replacer(key, value) { return key === "n" ? value * 2 : value; },
  space: "--",
}));
let calls = 0;
try {
  roundtrip("{", { reviver() { calls++; } });
} catch (error) { console.log(error.name, calls); }
const gap = process.argv[2];
console.log(JSON.stringify({ n: 1 }, (key, value) => value, gap));
