// Array.prototype.fill — mutate in place and return the receiver, JS-exact
// index handling: omitted/negative/out-of-range/reversed ranges, empty
// arrays, string (ref) elements, and the returned-identity contract.
const a1 = [1, 2, 3, 4, 5];
console.log(JSON.stringify(a1.fill(0)));
const a2 = [1, 2, 3, 4, 5];
console.log(JSON.stringify(a2.fill(9, 1, 3)));
const a3 = [1, 2, 3, 4, 5];
console.log(JSON.stringify(a3.fill(7, -2)));
const a4 = [1, 2, 3, 4, 5];
console.log(JSON.stringify(a4.fill(7, -100, 2)));
const a5 = [1, 2, 3, 4, 5];
console.log(JSON.stringify(a5.fill(7, 3, 1)));
const a6 = [1, 2, 3, 4, 5];
console.log(JSON.stringify(a6.fill(7, 1, 100)));
const a7 = [1, 2, 3, 4, 5];
console.log(JSON.stringify(a7.fill(7, 10, 20)));
const a8 = [1, 2, 3, 4, 5];
console.log(JSON.stringify(a8.fill(7, 1.7, 3.2)));

// Empty receiver.
const empty: number[] = [];
console.log(JSON.stringify(empty.fill(1)));

// Returns the SAME array (identity), so chaining mutates in place.
const a9 = [1, 2, 3];
console.log(a9.fill(0) === a9, JSON.stringify(a9));

// String (ref) elements: the same value written into every filled slot.
const s1 = ["a", "b", "c", "d"];
console.log(JSON.stringify(s1.fill("z", 1, 3)));

// Boolean elements.
const b1 = [true, false, true, false];
console.log(JSON.stringify(b1.fill(true, 2)));

// Fill then read, and a fresh-array chain.
console.log(JSON.stringify([0, 0, 0].fill(5)));
