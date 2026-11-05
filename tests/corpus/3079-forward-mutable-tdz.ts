export {};

function attempt(label: string, action: () => void): void {
  try { action(); console.log(label, "unexpected success"); }
  catch (error) {
    if (error instanceof Error) console.log(label, error.name, error.message);
  }
}

function numeric(): void {
  let effects = "";
  const rhs = (): number => { effects += "R"; return 5; };
  const read = () => { console.log(value); };
  const write = () => { value = rhs(); };
  const expression = () => { console.log(value = rhs()); };
  const add = () => { value += rhs(); };
  const increment = () => { value++; };
  const decrement = () => { console.log(--value); };
  attempt("read", read);
  attempt("write", write);
  attempt("expression", expression);
  attempt("add", add);
  attempt("increment", increment);
  attempt("decrement", decrement);
  console.log("effects", effects);
  let value = 1;
  write();
  expression();
  add();
  increment();
  decrement();
  console.log("initialized", value, effects);
}
numeric();

function references(): void {
  const rhs = () => ({ label: "allocated", values: [1, 2, 3] });
  const write = () => { value = rhs(); };
  const expression = () => { console.log((value = rhs()).label); };
  attempt("record write", write);
  attempt("record expression", expression);
  let value = { label: "initial", values: [0] };
  write();
  expression();
  console.log(value.label, value.values.join(","));
}
references();

function text(): void {
  const append = () => { value += "!"; };
  const write = () => { value = "after"; };
  attempt("text append", append);
  attempt("text write", write);
  let value = "before";
  append();
  console.log(value);
}
text();

// Calls during the initializer still see an empty box. The declaration
// becomes initialized only after its RHS returns normally.
function initializer(): void {
  const set = () => { value = 3; };
  const init = (): number => { attempt("inside initializer", set); return 2; };
  let value = init();
  set();
  console.log("initializer", value);
}
initializer();

// A throwing initializer never initializes the box. An escaped closure
// still throws even after the declaring stack frame has unwound.
let escaped: () => void = () => { console.log("unset"); };
function failed(): void {
  escaped = () => { console.log(value); };
  function fail(): number { throw new Error("init failed"); }
  let value = fail();
  void value;
}
attempt("failed initializer", () => { failed(); });
attempt("escaped read", escaped);
