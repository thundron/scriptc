function observe(value: number, count: number): void {
  let state = value;
  for (let i = 0; i < count; i++) state = Math.imul(state ^ i, 17) >>> 0;
  console.log(state, 1 / state, state | 0, state >>> 0, ~state, Math.clz32(state));
}

for (const value of [-0, 0, 0.5, -1.75, NaN, Infinity, -Infinity, 2147483648, 4294967295, 4294967296, 9007199254740992, 1e100, -1e100]) {
  observe(value, 0);
  observe(value, 4);
}

function snapshots(input: number): void {
  for (let round = 0; round < 2; round++) {
    let value = input;
    console.log(value ^ (value = 9), value, value >>> 0);
    value = input;
    console.log(Math.imul(value, value = 7), value >>> 0);
    value = input;
    console.log(value++ | value, ++value ^ value, value-- >>> 0, value >>> 0);
    value = input;
    console.log((value = value ^ 5) + 0.25, value, value >>> 0);
  }
}
snapshots(2.75);
snapshots(-0);
snapshots(4294967295);

function captured(): void {
  let value = 1;
  const change = (): number => { value = 5.5; return 2; };
  for (let i = 0; i < 2; i++) console.log(value ^ change(), value | 0, value);
}
captured();

function joins(seed: number): void {
  let value = seed;
  for (let i = 0; i < 7; i++) {
    if (i === 1) { value = -0; continue; }
    if (i === 3) value = NaN;
    else value = Math.imul(value, 3);
    try {
      if (i === 4) { value = 4294967297; throw new Error("update"); }
      console.log("try", value >>> 0, value);
    } catch {
      console.log("catch", value >>> 0);
      value = -1.25;
    } finally {
      value = value + 0.5;
      console.log("finally", value | 0, value);
    }
  }
}
joins(-0);

let globalValue = 3.5;
function globalChange(): number { globalValue = 7.75; return 2; }
console.log(globalValue ^ globalChange(), globalValue | 0, globalValue);

function iteration(): void {
  let total = 0;
  for (const value of [1.5, -2.5, 4294967297]) total = total ^ value;
  for (let i = 0; i < 4; i++) total = total ^ i;
  console.log(total);
}
iteration();
