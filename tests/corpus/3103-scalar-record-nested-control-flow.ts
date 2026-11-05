let trace = 0;
function mark(value: number): number {
  trace = trace * 10 + value;
  return value;
}
function choose(value: number): { left: number; right: number } {
  outer: for (let i = 0; i < 4; i++) {
    switch (i) {
      case 0: if (value === 0) return { right: mark(2), left: mark(1) }; break;
      case 1: if (value < 0) continue outer; break;
      default: if (i === value) return { left: value + mark(3), right: i + mark(4) };
    }
  }
  return { right: -0, left: value };
}
function consume(value: number): number {
  const a = choose(mark(value));
  const b = choose(value + 1);
  return a.left + a.right + b.left + b.right;
}
for (const value of [0, 2, -1]) {
  trace = 0;
  console.log("nested", value, consume(value), trace);
}

function branch(value: number): { result: number } {
  let count = 0;
  again: do {
    if (value === 0) break again;
    count++;
    if (count < value) continue again;
    return { result: count };
  } while (count < 4);
  return { result: -1 };
}
function branches(): void {
  for (const value of [0, 1, 3, 7]) {
    const output = branch(value);
    console.log("branch", value, output.result);
  }
}
branches();

function effect(value: number): number {
  console.log("effect", value);
  if (value === 9) throw new Error("nine");
  return value;
}
function ordered(value: number): { first: number; second: number } {
  return { second: effect(value), first: effect(value + 1) };
}
function completion(value: number): void {
  try {
    const result = ordered(effect(value));
    console.log("result", result.first);
  } catch (error) {
    if (error instanceof Error) console.log("caught", error.message);
  } finally {
    console.log("cleanup", value);
  }
}
completion(3);
completion(8);
completion(9);

function singleton(value: number): { value: number } { return { value }; }
function observations(): void {
  const captured = singleton(11);
  const read = (): number => captured.value;
  console.log("capture", read());
  const escaped = singleton(12);
  const array = [escaped];
  array[0]!.value = 13;
  console.log("escape", escaped.value);
  for (const header = singleton(14); header.value > 0;) {
    console.log("header", header.value);
    break;
  }
  const tuple = [singleton(15), singleton(16)];
  console.log("tuple", tuple[0]!.value, tuple[1]!.value);
}
observations();

function signed(value: number): { zero: number; infinity: number } {
  return { zero: value === 0 ? -0 : 0, infinity: value === 0 ? Infinity : -Infinity };
}
function numeric(): void {
  const first = signed(0);
  const second = signed(1);
  console.log("numeric", 1 / first.zero, first.infinity, 1 / second.zero, second.infinity);
}
numeric();
