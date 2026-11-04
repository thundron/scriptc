function choose(seed: number, count: number): number {
  let value = seed;
  for (let i = 0; i < count; i++) {
    value = i % 2 === 0 ? Math.imul(value, 5) : value ^ 17;
    value = (value & 255) || (value >>> 1);
    value = (value | 1) && Math.imul(value, 3);
  }
  return value;
}
for (const seed of [-0, 0, 0.75, -3.75, NaN, Infinity, 4294967295]) {
  console.log(choose(seed, 0), 1 / choose(seed, 0), choose(seed, 9));
}

function lazy(input: number, flag: boolean): void {
  let value = input;
  let calls = 0;
  const touch = (): number => { calls++; return 7.5; };
  const result = flag ? value | 0 : touch();
  console.log(result, result >>> 0, calls);
  console.log((value | 0) || touch(), calls);
  console.log((value | 0) && touch(), calls);
  console.log(flag ? (value = -0) : (value = 4294967297), 1 / value, value >>> 0);
}
lazy(-0, true);
lazy(-2.75, false);

function nested(input: number, flag: boolean): void {
  for (let i = 0; i < 2; i++) {
    let value = input;
    console.log(value ^ (flag ? (value = 12.5) : (value = -0)), value, value >>> 0);
    console.log(Math.imul(value, flag ? (value = 3) : (value = 5)), value >>> 0);
  }
}
nested(1.5, true);
nested(-3.5, false);
