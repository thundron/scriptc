export function calculate(count: number): number {
  let value = 0;
  for (let i = 0; i < count; i++) {
    value += i;
  }
  return value;
}
