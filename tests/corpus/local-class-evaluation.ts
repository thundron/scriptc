function make(value: number) {
  return () => class Local {
    read(): number { return value; }
    async delayed(): Promise<number> { await Promise.resolve(); return ++value; }
  };
}
const evaluate = make(2);
const First = evaluate();
const Second = evaluate();
const first = new First();
const second = new Second();
console.log(First === Second, await first.delayed(), second.read());

function loop(): number[] {
  const reads: (() => number)[] = [];
  for (let i = 0; i < 3; i++) {
    const Local = class { read(): number { return i; } };
    const value = new Local();
    reads.push(() => value.read());
  }
  return reads.map((read) => read());
}
console.log(loop().join(","));

function tdz(): void {
  const Local = class { read(): number { return later; } };
  const value = new Local();
  try { console.log(value.read()); } catch (error) { console.log((error as Error).name); }
  let later = 17;
  console.log(value.read());
}
tdz();
