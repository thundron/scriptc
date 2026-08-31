class Token {
  id: number;
  constructor(id: number) { this.id = id; }
}

class DerivedToken extends Token {
  extra: number;
  constructor(id: number, extra: number) {
    super(id);
    this.extra = extra;
  }
}

const numbers = new WeakMap<Token, number>();
const live = new Token(1);
numbers.set(live, 10);
console.log(numbers.has(live));
console.log(numbers.get(live));
numbers.set(live, 11);
console.log(numbers.get(live));
console.log(numbers.delete(live));
console.log(numbers.has(live));

const derived = new DerivedToken(2, 20);
const base: Token = derived;
numbers.set(base, 22);
console.log(numbers.has(derived));
console.log(numbers.get(derived));

function expireNumber(n: number): void {
  const key = new Token(n);
  numbers.set(key, n);
}
for (let i = 0; i < 400; i++) {
  expireNumber(i);
  const fresh = new Token(i + 1000);
  if (numbers.has(fresh)) console.log("stale-number");
}

const strings = new WeakMap<Token, string>();
const stringKey = new Token(3);
strings.set(stringKey, "three");
console.log(strings.get(stringKey));
strings.set(stringKey, "THREE");
console.log(strings.get(stringKey));
console.log(strings.delete(stringKey));

function expireString(n: number): void {
  const key = new Token(n);
  strings.set(key, "gone");
}
for (let i = 0; i < 400; i++) {
  expireString(i);
  const fresh = new Token(i + 2000);
  if (strings.has(fresh)) console.log("stale-string");
}

const flags = new WeakMap<Token, boolean>();
const flagKey = new Token(9);
flags.set(flagKey, false);
console.log(flags.has(flagKey));
console.log(flags.get(flagKey));

class Solo {
  id: number;
  constructor(id: number) { this.id = id; }
}
const solos = new WeakMap<Solo, number>();
function expireSolo(n: number): void {
  const key = new Solo(n);
  solos.set(key, n);
}
for (let i = 0; i < 400; i++) {
  expireSolo(i);
  const fresh = new Solo(i + 3000);
  if (solos.has(fresh)) console.log("stale-solo");
}

class CyclicToken {
  peer: CyclicToken | null = null;
}
const cycles = new WeakMap<CyclicToken, number>();
function expireCycle(): void {
  const a = new CyclicToken();
  const b = new CyclicToken();
  a.peer = b;
  b.peer = a;
  cycles.set(a, 1);
}
expireCycle();
console.log("cycle-done");
