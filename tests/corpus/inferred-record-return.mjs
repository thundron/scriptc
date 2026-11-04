const empty = { _tag: "Empty" };
function combine(first, second) { return { _tag: "Then", first, second }; }
function build(values) {
  let result = empty;
  for (const value of values) result = combine(result, value);
  return result;
}
console.log(JSON.stringify(build([1, 2])));
