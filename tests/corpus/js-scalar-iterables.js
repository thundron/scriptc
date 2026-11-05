const names = { left: "left", arrowLeft: "left", right: "right" };
const unique = new Set(Object.values(names));
console.log([...unique].join(","));
console.log([...Object.values(names), "escape"].join(","));
const points = { one: 1, two: 2, again: 1 };
console.log([...new Set(Object.values(points))].join(","));
console.log([0, ...Object.values(points), 3].join(","));
const flags = { a: true, b: false };
console.log([...Object.values(flags), true].join(","));
let reads = 0;
function values() { reads++; return Object.values(names); }
console.log([...new Set(values())].join(","), reads);
console.log([...values(), "tail"].join(","), reads);
