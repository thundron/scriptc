function classify(value) {
  if (typeof value === "bigint") return value >= 0n ? "positive bigint" : "negative bigint";
  if (typeof value === "number") return value >= 0 ? "positive number" : "negative number";
  if (typeof value === "string") return value.toUpperCase();
  return "other";
}
const values = JSON.parse('[null,4,-2,"hello",false]');
values.push(9007199254740993n);
values.push(-9007199254740993n);
for (const value of values) console.log(classify(value));
