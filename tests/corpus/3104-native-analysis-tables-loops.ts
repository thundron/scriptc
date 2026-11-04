const table = [7, -0, 2.5, Infinity, -Infinity];
function lookup(index: number): number { return table[index] * 1; }
console.log("table", lookup(0), 1 / lookup(1), lookup(2), lookup(3), lookup(4), table.length);
console.log("missing", lookup(-1), lookup(0.5), lookup(5));

const mutated = [10, 20, 30];
function index(): number { mutated[0] = 40; return 0; }
console.log("mutated-index", mutated[index()] * 1);
const escaped = [1, 2];
function expose(): number[] { return escaped; }
expose()[1] = 3;
console.log("escaped", escaped[1] * 1);

const bytes = new Uint8Array([1, 2, 3, 4]);
function sum(): number {
  let total = 0;
  for (let i = 0; i < bytes.length; i++) total += bytes[i];
  return total;
}
function changed(): number {
  let total = 0;
  for (let i = 0; i < bytes.length; i++) {
    if (i === 0) i++;
    total += bytes[i];
  }
  return total;
}
function nested(): number {
  let total = 0;
  for (let i = 0; i < bytes.length; i++) {
    try {
      if (i === 0) total += bytes[++i];
      else total += bytes[i];
    } finally { total += 10; }
  }
  return total;
}
console.log("loops", sum(), changed(), nested());
