function failing(): Promise<number> {
  return new Promise<number>((_resolve, reject) => reject(new Error("receiver")));
}

async function main(): Promise<void> {
  const fulfilled = await Promise.resolve(2).then((value) => value + 1, () => 0);
  console.log("fulfilled", fulfilled);

  const rejected = await failing().then(() => "unexpected", (error) => {
    if (error instanceof Error) return error.message;
    return "not an Error";
  });
  console.log("rejected", rejected);

  const handlerThrow = await Promise.resolve("value")
    .then((): string => { throw new Error("handler"); }, () => "wrong handler")
    .catch((error) => {
      if (error instanceof Error) return error.message;
      return "not an Error";
    });
  console.log("handler throw", handlerThrow);

  const flattened = await Promise.resolve(5).then(
    (value) => Promise.resolve(value + 1),
    () => Promise.resolve(0),
  );
  console.log("flattened", flattened);

  const identity = await Promise.resolve(8).then(undefined, () => 0);
  console.log("identity", identity);

  const passedRejection = await failing().then(() => "wrong", undefined).catch((error) => {
    if (error instanceof Error) return error.message;
    return "not an Error";
  });
  console.log("passed rejection", passedRejection);
}

void main();
