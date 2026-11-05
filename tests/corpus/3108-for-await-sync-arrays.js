const events = [];

Promise.resolve()
  .then(() => events.push("micro-1"))
  .then(() => events.push("micro-2"))
  .then(() => events.push("micro-3"));

async function main() {
  const values = [1, 2];
  for await (const value of values) {
    events.push(`value-${value}`);
    if (value === 1) values.push(3);
  }
  events.push("done");
  console.log(events.join(","));

  let a = 0;
  let b = 0;
  for await ([a, b] of [[1, 2], [3, 4]]) console.log(a, b);
  var item = "seed";
  for await (var item of ["x", "y"]) console.log(item);
  console.log(item);

  for await (const promised of [Promise.resolve(5), Promise.resolve(6)]) {
    console.log("promised", promised);
  }

  const sparsePromises = [Promise.resolve(7), , Promise.resolve(8)];
  for await (const promised of sparsePromises) {
    console.log("sparse-promised", promised);
  }

  const end = [];
  for await (const value of [9]) {
    end.push(`body-${value}`);
    Promise.resolve().then(() => end.push("tick-1")).then(() => end.push("tick-2"));
  }
  end.push("after");
  console.log(end.join(","));

  const breaks = [];
  for await (const value of [1]) {
    breaks.push(`body-${value}`);
    Promise.resolve().then(() => breaks.push("tick-1")).then(() => breaks.push("tick-2"));
    break;
  }
  breaks.push("after");
  console.log(breaks.join(","));

  const returns = [];
  async function returnEarly() {
    for await (const value of [1]) {
      returns.push(`body-${value}`);
      Promise.resolve().then(() => returns.push("tick-1")).then(() => returns.push("tick-2"));
      return;
    }
  }
  await returnEarly();
  returns.push("after");
  console.log(returns.join(","));

  const throws = [];
  try {
    for await (const value of [1]) {
      throws.push(`body-${value}`);
      Promise.resolve().then(() => throws.push("tick-1")).then(() => throws.push("tick-2"));
      throw new Error("stop");
    }
  } catch {
    throws.push("caught");
  }
  console.log(throws.join(","));

  const labels = [];
  outer: for (const round of [1, 2]) {
    for await (const value of [3]) {
      labels.push(`body-${round}-${value}`);
      Promise.resolve().then(() => labels.push(`tick-${round}`));
      if (round === 1) continue outer;
      break outer;
    }
  }
  labels.push("after");
  console.log(labels.join(","));

  const rejection = [];
  const rejectedItem = Promise.resolve(1).then((value) => {
    if (value === 1) throw new Error("nope");
    return value;
  });
  Promise.resolve().then(() => rejection.push("tick-1")).then(() => rejection.push("tick-2"));
  try {
    for await (const value of [rejectedItem]) rejection.push(`body-${value}`);
  } catch {
    rejection.push("caught");
  }
  rejection.push("after");
  console.log(rejection.join(","));
}

main();
