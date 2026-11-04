let evaluated = 0;
function scalar() {
  evaluated++;
  return "u32";
}
function defineStruct(fields) {
  for (const [name, type, options = {}] of fields) {
    console.log(name, Array.isArray(type) ? type.join(",") : type, options.lengthOf);
  }
}
defineStruct([
  ["startCols", ["u32"]],
  ["startColsLen", "u32", { lengthOf: "startCols" }],
  ["widthCols", ["u32"]],
  ["widthColsLen", "u32", { lengthOf: "widthCols" }],
  ["widthColsMax", scalar()],
]);
console.log("evaluated", evaluated);
