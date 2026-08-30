// Array.prototype.flat — flatten nested arrays. Default depth 1, explicit
// depths (0, 2, Infinity), nested empties, and non-nested receivers (the
// shallow-copy case). scriptc arrays are uniformly typed, so the depth is a
// compile-time constant and the flattened element type is fixed.
console.log(JSON.stringify([[1, 2], [3, 4], [5]].flat()));
console.log(JSON.stringify([[1, 2], [3, 4]].flat(0)));
console.log(JSON.stringify([[1, 2], [3, 4]].flat(1)));

// Deeper nesting with explicit and Infinity depths.
const deep = [[[1], [2]], [[3, 4]], [[5]]];
console.log(JSON.stringify(deep.flat()));
console.log(JSON.stringify(deep.flat(2)));
console.log(JSON.stringify(deep.flat(Infinity)));

// Nested empties flatten away.
console.log(JSON.stringify([[], [], []].flat()));
console.log(JSON.stringify([[1], [], [2, 3], []].flat()));

// A non-nested receiver: flat() is a shallow copy.
const flat1 = [1, 2, 3];
const copy = flat1.flat();
console.log(JSON.stringify(copy), copy === flat1);

// String elements.
console.log(JSON.stringify([["a", "b"], ["c"]].flat()));

// The copy is fresh — mutating it never touches the source.
const src = [[1, 2], [3, 4]];
const f = src.flat();
f.push(99);
console.log(JSON.stringify(src), JSON.stringify(f));

// flat(0) on a nested array copies at the top level (inner refs shared).
const g = [[1], [2]];
const g0 = g.flat(0);
console.log(JSON.stringify(g0), g0 === g);
