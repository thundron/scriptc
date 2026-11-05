type Validator = ((x: unknown) => boolean) & { errors: string[] | null };
function validate(x: unknown): boolean {
  validate.errors = typeof x === "number" ? null : ["number required"];
  return validate.errors === null;
}
validate.errors = null as string[] | null;
validate.tag = 7;
const fn: Validator = validate;
console.log(fn(1), fn.errors === null);
console.log(fn("x"), JSON.stringify(fn.errors));
fn.errors = ["alias"];
console.log(JSON.stringify(validate.errors));
validate.errors = ["declaration"];
console.log(JSON.stringify(fn.errors));
const again: Validator = validate;
console.log(again === fn, validate === fn);
console.log(validate.tag);
again.errors = null;
console.log(fn.errors === null, validate.errors === null);

console.log(typeof fn);
