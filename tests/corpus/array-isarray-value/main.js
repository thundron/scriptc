const isArray = Array.isArray;
const copy = isArray;
console.log(isArray === copy, isArray === Array.isArray);
console.log(isArray([]), isArray([1, 2]), isArray({ length: 2 }));
console.log(isArray(null), isArray(undefined), isArray("text"));
console.log(isArray(new Uint8Array(2)), isArray(Symbol("value")));
console.log([[], {}, 1, null].map(isArray).join(","));
console.log(isArray());
