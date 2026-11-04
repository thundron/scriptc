function split(input: string, separator: RegExp, limit?: number): void {
  const values = limit === undefined ? input.split(separator) : input.split(separator, limit);
  console.log(JSON.stringify(values), values.length, values.join("|"));
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    console.log(index, typeof value, value === undefined ? "missing capture" : value);
  }
  let visited = 0;
  values.forEach(() => { visited++; });
  console.log("visited", visited);
}

split("left=right;tail", /([=;])/);
split("a,b;c", /(,)|(;)()/);
split("aaa", /(a)(a)?/);
split("abc", /((b))/);
split("a,b", /(?<separator>,)/);
split("a,b;c", /(?:,)|(;)/);
split("abc", /()/);
split("abc", /()$/);
split("abc", /(^)/);
split("abc", /($)/);
split("abc", /(?=(b))/);
split("abc", /(?<=(b))/);
split("abc", /x*(x)?/);
split("", /()/);
split("", /(x)/);
split(",", /(,)/);
split(",a,", /(,)/);
split("a\nb\rc", /(\r?\n)|(\r)/);
split("a,b,c", /(,)/g);
split("a,b,c", /(,)/y);
split("a,b,c", /(,)/gy);
split("a💡b💡c", /(💡)/u);
split("💡💡", /()/u);
// Surrogate halves follow the documented UTF-8 replacement behavior;
// pin non-Unicode advancement through lengths without serializing halves.
const units = "💡💡".split(/()/);
console.log(units.length, units.map((value) => value === undefined ? -1 : value.length).join(","));

for (const limit of [0, 1, 2, 3, 4, 5, 6, 100, -1, 2.9, NaN, Infinity, 4294967296, 4294967298]) {
  split("a,b;c", /(,)|(;)()/, limit);
}

// Reusing a regex must not leak capture slots between participating and
// nonparticipating groups or retain any result array from the previous call.
const reused = /(,)|(;)()/;
for (let index = 0; index < 5; index++) {
  split(index % 2 === 0 ? "a,b" : "x;y", reused, 4);
}

// The declaration projector needs both the separators and the type names.
const declaration = "Box | Box[] | Map<string, Box>";
console.log(declaration.split(/([\s[\]<>()|,]+)/).map((name) => name === "Box" ? "Internal" : name).join(""));

let order = "";
function source(): string { order += "source;"; return "a,b"; }
function pattern(): RegExp { order += "pattern;"; return /(,)/; }
function count(): number { order += "limit;"; return 2; }
console.log(JSON.stringify(source().split(pattern(), count())), order);
