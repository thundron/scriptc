const generatorConstructor = function* () {}.constructor;
const asyncConstructor = async function () {}.constructor;
function kind(value) {
  return value.constructor === generatorConstructor ? "generator"
    : value.constructor === asyncConstructor ? "async" : "ordinary";
}
console.log(kind(function* () { yield 1; }));
console.log(kind(async function () { return 2; }));
console.log(kind(() => 3));
