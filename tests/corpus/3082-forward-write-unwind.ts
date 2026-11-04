export {};

// No explicit throw in this program: the may-throw graph must discover the
// TDZ store itself and propagate it through direct and closure calls.
function writes(): void {
  function set(): void { value = 9; }
  try { set(); console.log("unreachable direct"); }
  catch (error) { if (error instanceof Error) console.log("direct", error.name, error.message); }
  const assign = () => value = 4;
  try { assign(); console.log("unreachable indirect"); }
  catch (error) { if (error instanceof Error) console.log("indirect", error.name, error.message); }
  let value = 1;
  set();
  console.log("after", assign(), value);
}
writes();

function increments(): void {
  function up(): void { count++; }
  function down(): void { --count; }
  try { up(); console.log("unreachable increment"); }
  catch (error) { if (error instanceof Error) console.log("increment", error.name, error.message); }
  try { down(); console.log("unreachable decrement"); }
  catch (error) { if (error instanceof Error) console.log("decrement", error.name, error.message); }
  let count = 3;
  up();
  down();
  console.log("count", count);
}
increments();
