function* inner(label: string): Generator<string, string, unknown> {
  console.log("start", label);
  const sent = yield label;
  return label + ":" + (sent as string);
}

function combine(left: string, right: string): string {
  return left + "|" + right;
}

function* outer(): Generator<string, string, unknown> {
  const first = yield* inner("one");
  console.log("first", first);
  const skipped = false ? yield* inner("skipped") : "kept";
  return combine(skipped, yield* inner("two"));
}

const iterator = outer();
console.log(iterator.next().value);
console.log(iterator.next("A").value);
console.log(iterator.next("B").value);
console.log(iterator.next().done);

function* instant(): Generator<string, number, unknown> {
  if (false) yield "never";
  return 42;
}

function* nested(): Generator<string, number, unknown> {
  return (yield* instant()) + (yield* instant());
}
console.log(nested().next().value);

function* failure(): Generator<string, number, unknown> {
  yield "before failure";
  throw new Error("delegate failed");
}
function* caught(): Generator<string, string, unknown> {
  try {
    console.log(yield* failure());
  } catch (error) {
    console.log((error as Error).message);
  }
  return "caught";
}
const failing = caught();
console.log(failing.next().value);
console.log(failing.next().value);
