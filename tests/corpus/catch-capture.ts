function save(value: unknown): () => unknown {
  try { throw value; }
  catch (error) { return () => error; }
}
const error = new Error("original");
const saved = save(error)();
console.log(saved instanceof Error && saved === error, save(42)(), save("hello")());

function rethrow(): () => never {
  try { throw error; }
  catch (caught) { return () => { throw caught; }; }
}
try { rethrow()(); }
catch (caught) { if (caught instanceof Error) console.log(caught === error, caught instanceof Error); }

function nested(): () => () => string {
  try { throw new TypeError("nested"); }
  catch (caught) { return () => () => String(caught); }
}
console.log(nested()()());

function cycle() {
  const object: { callback?: () => unknown } = {};
  const value: unknown = object;
  try { throw value; }
  catch (caught) { object.callback = () => caught; }
  console.log(object.callback!() === value);
}
cycle();
