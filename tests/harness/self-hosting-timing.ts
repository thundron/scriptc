export async function bootstrapStep<T>(name: string, work: () => Promise<T>): Promise<T> {
  console.log(`bootstrap: ${name}`);
  const started = performance.now();
  try {
    return await work();
  } finally {
    console.log(`bootstrap: ${name} took ${((performance.now() - started) / 1000).toFixed(1)}s`);
  }
}
