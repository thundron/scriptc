async function main() {
  const numberSource = Promise.resolve(42);
  const numberValue: unknown = numberSource;
  const first = numberValue as Promise<number>;
  const second = numberValue as Promise<number>;
  console.log(first === second, first === numberSource, first !== Promise.resolve(42));
  console.log(await first);
  const flag: unknown = Promise.resolve(true);
  const text: unknown = Promise.resolve("hello");
  const record: unknown = Promise.resolve({ value: 7 });
  const empty: unknown = Promise.resolve();
  console.log(await (flag as Promise<boolean>), await (text as Promise<string>), (await (record as Promise<{ value: number }>)).value);
  await (empty as Promise<void>);
  console.log(undefined);
  const failed: unknown = Promise.reject(new Error("original"));
  try { await (failed as Promise<number>); }
  catch (error) { console.log((error as Error).message); }
}
main();
