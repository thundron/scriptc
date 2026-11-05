let evaluations = 0;
function source(kind: number): number[] | Float32Array | number | undefined {
  evaluations++;
  if (kind === 0) return [1.5, 2.5];
  if (kind === 1) return new Float32Array([3.5, 4.5]);
  if (kind === 2) return 3;
  return undefined;
}
for (let i = 0; i < 4; i++) {
  // @ts-expect-error JavaScript accepts every arm, although no single TS overload does.
  const values = new Float32Array(source(i));
  console.log(values.length, values.join(','), evaluations);
}
function copy(values: number[] | Float32Array) { return new Uint16Array(values); }
const original = new Float32Array([10.5, 20.5]);
const cloned = copy(original);
original[0] = 100;
console.log(cloned.join(','), copy([65537, -1]).join(','));
try { new Float32Array(source(2) === 3 ? -1 : 0); } catch (e) { console.log(e instanceof RangeError); }
