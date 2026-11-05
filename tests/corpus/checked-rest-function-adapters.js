const decorate = (value, ...suffixes) => "prefix:" + value + ":" + suffixes.join(",");
const identity = (value, ..._suffixes) => value;
function render(enabled) {
  const format = enabled ? decorate : identity;
  console.log(format("item", "one", "two"));
  console.log(format(42));
}
render(true);
render(false);
function full(value) { return "full:" + arguments.length + ":" + arguments[1]; }
function other(value) { return value; }
function select(flag) {
  const picked = flag ? full : other;
  console.log(picked("first", "second", 3));
}
select(true);
select(false);
