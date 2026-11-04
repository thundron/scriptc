function transform(input: string, suffix: string): string {
  return input.trim().toUpperCase() + suffix;
}
let changing = "a";
for (let index = 0; index < 4; index++) {
  changing = transform(changing, String(index));
  console.log(changing);
}
function build(input: string): string[] {
  const values: string[] = [];
  for (let index = 0; index < input.length; index++) {
    const part = input.slice(index);
    if (part.startsWith("b")) continue;
    values.push(part.trim());
  }
  return values;
}
console.log(build("abc ").join("|"));
function windows(input: string): string {
  let output = "";
  for (let index = 0; index < input.length; index++) {
    try {
      const part = input.substring(index, index + 2);
      if (part === "cd") break;
      output += part;
    } finally {
      output += ":";
    }
  }
  return output;
}
console.log(windows("abcdef"));
