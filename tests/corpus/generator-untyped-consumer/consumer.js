export function consume(factory) {
  const iterator = factory();
  console.log(iterator.next().value);
  const result = iterator.next("sent");
  console.log(result.value, result.done);
  console.log(iterator.next().value, iterator.next().done);
}
export function close(iterator) {
  console.log(iterator.next().value);
  const result = iterator.return("closed");
  console.log(result.value, result.done);
}
export function fail(iterator) {
  console.log(iterator.next().value);
  try {
    iterator.throw("thrown");
  } catch (error) {
    console.log(error);
  }
  console.log(iterator.next().done);
}
export function same(left, right) {
  return left === right;
}
class OtherIterator {
  next() { return { value: "custom", done: true }; }
}
export function custom() {
  consume(() => new OtherIterator());
}
