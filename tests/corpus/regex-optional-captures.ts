const expression = /^(a)?(b*)$/;
for (const input of ["", "b", "ab"]) {
  const match = expression.exec(input);
  if (match === null) throw new Error("missing match");
  console.log(input, JSON.stringify(match), match[1] === undefined, match[2] === "", 1 in match);
  const matched = input.match(expression);
  console.log(JSON.stringify(matched));
}
for (const match of "b ab".matchAll(/(a)?(b)/g)) {
  console.log(JSON.stringify(match), match[1] === undefined, 1 in match);
}
const named = /(?<prefix>a)?(?<empty>b*)/.exec("")!.groups!;
console.log(named.prefix === undefined, named.empty === "", JSON.stringify(named), Object.keys(named).join(","));
console.log(/(?<value>a*)x|(?<value>b)/.exec("x")!.groups!.value === "");
