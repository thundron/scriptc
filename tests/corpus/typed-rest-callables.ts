function combine(prefix: string, ...values: string[]): string {
  return prefix + values.join(":");
}
function total(...values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}
const stored: unknown = combine;
const sum: unknown = total;
if (typeof stored === "function" && typeof sum === "function") {
  console.log(stored("empty"), stored("many:", "a", "b"));
  console.log(sum(), sum(1, 2, 3));
  console.log(stored.call(null, "call:", "c", "d"));
  console.log(stored.apply(null, ["apply:", "e", "f"]));
  const bound = stored.bind(null, "bound:", "g");
  console.log(bound("h", "i"));
}
