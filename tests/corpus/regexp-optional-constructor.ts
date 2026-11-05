let order = "";
function pattern(value: string | undefined): string | undefined {
  order += "p";
  return value;
}
function flags(value: string | undefined): string | undefined {
  order += "f";
  return value;
}
// @ts-expect-error JavaScript permits an undefined pattern.
const insensitive = new RegExp(pattern("a"), flags("i"));
console.log(insensitive.test("A"), order);
order = "";
// @ts-expect-error JavaScript permits an undefined pattern.
const empty = new RegExp(pattern(undefined), flags(undefined));
console.log(empty.test("anything"), order);
// @ts-expect-error JavaScript permits an undefined pattern.
console.log(new RegExp(undefined, undefined).test(""));
for (const onlyFirst of [true, false]) {
  const regex = new RegExp("a", onlyFirst ? undefined : "g");
  console.log("aba".replace(regex, "x"));
}
order = "";
try {
  // @ts-expect-error JavaScript permits an undefined pattern.
  new RegExp(pattern("a"), flags("gg"));
} catch (error) {
  if (error instanceof Error) console.log(error.name, order);
}
