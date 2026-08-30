const vals: number[] = [
  0, -0, 1, -1, 2, 3, 7, 255, 256,
  2147483647, 2147483648, 2147483649,
  4294967295, 4294967296, 4294967297,
  -2147483648, -2147483649, -4294967296,
  0.5, -0.5, 1.5, -1.5, 3.9, -3.9,
  1e21, -1e21, 1e-10, 123456789.123,
  NaN, Infinity, -Infinity,
  0.9999999999, 4294967296.5, -4294967296.5,
];
const shifts: number[] = [0, 1, 3, 7, 15, 16, 31, 32, 33, 63, 64, -1, -31, -32, 255, 2147483648, NaN, Infinity];

function tag(x: number): string {
  return Number.isNaN(x) ? "NaN" : x + "";
}

for (let ai = 0; ai < vals.length; ai++) {
  const a = vals[ai];
  for (let bi = 0; bi < vals.length; bi++) {
    const b = vals[bi];
    console.log(tag(a & b));
    console.log(tag(a | b));
    console.log(tag(a ^ b));
  }
  console.log(tag(~a));
}

for (let ai = 0; ai < vals.length; ai++) {
  const a = vals[ai];
  for (let si = 0; si < shifts.length; si++) {
    const s = shifts[si];
    console.log(tag(a << s));
    console.log(tag(a >> s));
    console.log(tag(a >>> s));
  }
}
