function extensions(file: string, values: string[]): string[] {
  const out: string[] = [];
  for (const extension of values) out.push(file.replace(/\.(js|mjs|cjs)$/, extension));
  return out;
}
console.log(extensions("entry.js", [".ts", ".tsx", ".mts", ".cts"]).join(","));
console.log(extensions("entry.json", [".ts", ".mts"]).join(","));

function optional(index: number): void {
  // Unchecked array reads can yield undefined despite a string checker
  // type. RegExp's replacement conversion consumes that actual value.
  const values = ["$&-$`-$'", ""];
  const value = values[index];
  console.log("left right left".replace(/left/, value));
  console.log("left right left".replace(/left/g, value));
  console.log("left right left".replaceAll(/left/g, value));
  console.log("unchanged".replace(/missing/, value));
}
optional(0);
optional(1);
optional(2);

const templates = ["$1", "$2$1", "$$", "$<word>"];
for (const template of templates) {
  console.log("ab ab".replace(/(?<word>a)(b)/g, template));
  console.log("😀a😀".replace(/(?:)/gu, template));
}
let order = "";
function receiver(): string { order += "receiver;"; return "abc"; }
function pattern(): RegExp { order += "pattern;"; return /b/; }
function replacement(): string[] { order += "replacement;"; return []; }
console.log(receiver().replace(pattern(), replacement()[0]), order);
