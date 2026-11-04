const values = [0, -0, 1, -1, 255, 0.1, 0.5, 1.0000000000000002, Number.MIN_VALUE, Number.MAX_VALUE, 9007199254740991, 9007199254740992, 1e30, Infinity, -Infinity, NaN]
for (const value of values) {
  for (const radix of [2, 3, 8, 10, 16, 36]) console.log(value.toString(radix))
}
for (const radix of [0, 1, 37, NaN, Infinity]) {
  try { console.log((42).toString(radix)) } catch (error) { console.log(error instanceof RangeError, (error as Error).message) }
}
console.log((42).toString(undefined), (42).toString(16.9))
