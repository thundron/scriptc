function* returned(value) {
  yield "ready";
  return value;
}
function* delegated(value) {
  return yield* returned(value);
}
for (const value of [42, "world", { answer: 42 }]) {
  const iterator = delegated(value);
  console.log(JSON.stringify(iterator.next()));
  console.log(JSON.stringify(iterator.next()));
}
