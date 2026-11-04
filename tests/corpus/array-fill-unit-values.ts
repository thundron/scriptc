const empty = new Array<null>(3).fill(null);
console.log(JSON.stringify(empty), empty.map((value, index) => String(index) + ":" + String(value === null)).join(","));
const mixed: (number | null)[] = [1, 2, 3, 4];
console.log(JSON.stringify(mixed.fill(null, 1, -1)));
console.log(JSON.stringify(mixed.fill(7, 2)));
let calls = 0;
function nil(): null { calls++; return null; }
console.log(JSON.stringify(mixed.fill(nil())), calls);
const missing = new Array<undefined>(2).fill(undefined);
console.log(JSON.stringify(missing), missing.map((value, index) => String(index) + ":" + String(value === undefined)).join(","));
