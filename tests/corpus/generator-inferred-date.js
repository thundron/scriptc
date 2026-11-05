const dates = function* (initial) {
  yield new Date(initial);
  yield "ready";
  return new Date(initial + 1000);
};
function run(factory) {
  const iterator = factory(0);
  const first = iterator.next();
  console.log(first.done, first.value instanceof Date, first.value.toISOString());
  console.log(JSON.stringify(iterator.next()));
  const last = iterator.next(1000);
  console.log(last.done, last.value instanceof Date, last.value.toISOString());
  console.log(JSON.stringify(iterator.next()));
}
run(dates);
const neverResumed = function* (input) { yield new Date(input); };
console.log(typeof neverResumed);
