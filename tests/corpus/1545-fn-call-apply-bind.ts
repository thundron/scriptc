// Function.prototype.call/apply/bind with a nullish `this`: the call is the
// direct call. A real `this` has nowhere to route in compiled code.
function add(a: number, b: number): number { return a + b; }
function greet(n: string): string { return "hi " + n; }
function none(): number { return 42; }

console.log(add.call(null, 3, 4));
console.log(add.call(undefined, 10, 20));
console.log(add.apply(null, [5, 6]));
console.log(add.apply(undefined, [7, 8]));
console.log(greet.call(null, "x"));
console.log(none.call(null));
console.log(none.apply(null));
console.log(none.apply(null, []));
console.log(add.call(null, add.call(null, 1, 2), add.apply(null, [3, 4])));

const bound = add.bind(null);
console.log(bound(2, 3));
console.log(add.bind(undefined)(100, 1));

const asValue: (a: number, b: number) => number = add;
console.log(asValue.call(null, 8, 9));
