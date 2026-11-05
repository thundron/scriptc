const callbacks: (() => string)[] = [];
for (let i = 0, label = 'a'; i < 3; i++) {
  callbacks.push(() => `${i}:${label}`);
  label += 'b';
  if (i === 1) continue;
}
console.log(callbacks.map((fn) => fn()).join(','));
let initial: () => number = () => -1;
const body: (() => number)[] = [];
for (let i = 0, save = (initial = () => i); i < 2; i++) {
  body.push(() => i);
}
console.log(initial(), body.map((fn) => fn()).join(','));
let sum = 0;
for (let i = 1, end = i + 3; i < end; i++) sum += i;
console.log(sum);
let escaped: () => number = () => -1;
outer: for (let i = 0, n = 3; i < n; i++) {
  for (let j = 0, m = 2; j < m; j++) {
    escaped = () => i + j + n + m;
    if (j === 1) break outer;
  }
}
console.log(escaped());
