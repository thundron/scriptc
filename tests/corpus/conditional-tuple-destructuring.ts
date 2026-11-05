function select(reverse: boolean, first: string, second: string): string {
  const [left, right] = reverse ? [second, first] : [first, second];
  return left.toUpperCase() + ":" + right.toLowerCase();
}
console.log(select(false, "One", "Two"), select(true, "One", "Two"));

function choose(reverse: boolean) {
  const a = { value: 1 }, b = { value: 2 };
  const [left, right, amount] = reverse ? [b, a, 3] : [a, b, 4];
  left.value += amount;
  console.log(a.value, b.value, right.value);
}
choose(false);
choose(true);

const [only] = [...new Set(["one"])];
console.log(only);
const [first, ...rest] = [...new Set(["a", "b", "c"])];
console.log(first, rest.join(","));
