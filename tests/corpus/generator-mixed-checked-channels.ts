function* values(): Generator<unknown, number, unknown> {
  try {
    const resumed = yield "first";
    console.log("resumed", resumed);
    yield 7;
    return 42;
  } finally {
    console.log("finally");
  }
}

const iterator = values();
console.log(JSON.stringify(iterator.next()));
console.log(JSON.stringify(iterator.next("sent")));
console.log(JSON.stringify(iterator.next()));
console.log(JSON.stringify(iterator.next()));

const closed = values();
console.log(JSON.stringify(closed.next()));
console.log(JSON.stringify(closed.return(99)));

const thrown = values();
console.log(JSON.stringify(thrown.next()));
try {
  thrown.throw(new Error("stop"));
} catch (error) {
  console.log((error as Error).message);
}

function* delegated(): Generator<unknown, number, unknown> {
  const result = yield* values();
  return result + 1;
}
const outer = delegated();
console.log(JSON.stringify(outer.next()));
console.log(JSON.stringify(outer.next("outer")));
console.log(JSON.stringify(outer.next()));

for (const value of values()) console.log("loop", value);
