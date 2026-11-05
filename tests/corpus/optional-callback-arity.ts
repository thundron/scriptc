type Parser = ((value: unknown, options: unknown) => unknown) | undefined;
function choose(enabled: boolean): Parser {
  if (enabled) return (value: unknown) => value;
  return undefined;
}
const parse = choose(true);
if (parse) console.log(parse("value", { strict: true }));
console.log(choose(false) === undefined);
