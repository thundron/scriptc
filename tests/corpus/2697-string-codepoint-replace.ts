function show(value: number | undefined): void {
  console.log(value === undefined ? "undefined" : value);
}

const text = "A😀Z";
show(text.codePointAt(0));
show(text.codePointAt(1));
show(text.codePointAt(2));
show(text.codePointAt(3));
show(text.codePointAt(4));
show(text.codePointAt(-1));
show(text.codePointAt(1.9));
show(text.codePointAt(Infinity));
show(text.codePointAt(NaN));
show("".codePointAt(0));

console.log("a-a-a".replace("-", ""));
console.log("abc".replace("x", "y"));
console.log("abc".replace("", "x"));
console.log("abcabc".replace("bc", "[$&][$`][$']"));
console.log("a$a".replace("$", "$$"));
const pattern = "é";
const replacement = "😀";
console.log("café café".replace(pattern, replacement));

let order = "";
function source(): string { order += "s"; return "abc"; }
function search(): string { order += "p"; return "b"; }
function replacementValue(): string { order += "r"; return "X"; }
console.log(source().replace(search(), replacementValue()), order);
