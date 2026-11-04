const first = new Date("2024-02-03T04:05:06.789Z");
const alias = first;
const second = new Date(first);
console.log(first === alias, first === second);
console.log(first instanceof Date, alias instanceof Date, second instanceof Date);
function inspect(value) {
  console.log(value instanceof Date, value instanceof URL);
  if (value instanceof Date) console.log(value.getTime(), value.toISOString(), value.getUTCFullYear());
  if (value instanceof URL) console.log(value.href);
}
inspect(first);
inspect({});
inspect(null);
inspect(new URL("https://example.com/path"));
const invalid = new Date(NaN);
console.log(Number.isNaN(invalid.getTime()));
console.log(JSON.stringify({ date: first, invalid }));
console.log(new Date(null).getTime(), new Date(true).getTime());
console.log(Number.isNaN(new Date(undefined).getTime()));
function make() { return new Date(0); }
const returned = make();
inspect(returned);
