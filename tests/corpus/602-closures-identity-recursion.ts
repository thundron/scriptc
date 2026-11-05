// Function identity: declared functions are stable values; every arrow
// evaluation is a fresh object.
function named(): number {
  return 1;
}
const ref1 = named;
const ref2 = named;
console.log(ref1 === ref2, ref1 === named, ref1 !== named);
const arrowA = () => 1;
const arrowB = () => 1;
console.log(arrowA === arrowB, arrowA === arrowA);

// nested named function recursion (self-reference)
function fibViaNested(n: number): number {
  function go(k: number): number {
    if (k < 2) {
      return k;
    }
    return go(k - 1) + go(k - 2);
  }
  return go(n);
}
console.log(fibViaNested(12));

// nested function capturing enclosing state while recursing
function countdown(label: string): string {
  let trace = "";
  function step(n: number): string {
    trace = trace + n;
    if (n <= 0) {
      return trace + label;
    }
    return step(n - 1);
  }
  return step(4);
}
console.log(countdown("go"));

// declared function passed by name, then through variables
function inc(x: number): number {
  return x + 1;
}
function thrice(fn: (x: number) => number, x: number): number {
  return fn(fn(fn(x)));
}
const alias = inc;
console.log(thrice(inc, 0), thrice(alias, 10), inc === alias);

// returning functions from functions from functions
function adderFactory(a: number): (b: number) => (c: number) => number {
  return (b: number) => (c: number) => a + b + c;
}
console.log(adderFactory(1)(2)(3));
const add10 = adderFactory(4)(6);
console.log(add10(5), add10(90));

class BoundArrow {
  value = 4;
  read = ((increment: number) => this.value + increment).bind({ value: 100 });
}
const holder = new BoundArrow();
const read = holder.read;
console.log(read(2), read === holder.read);
holder.value = 9;
console.log(read(3));
const boundDefault = ((value = 12) => value * 2).bind(null);
console.log(boundDefault(), boundDefault(8));
