// Function replacements remain outside the static string and regex paths.
// exec lowers through the match intrinsic and RegExp construction compiles.
const m = /a(b)/.exec("ab");
const regexFn = "abc".replace(/b/, (s: string) => s);
const stringFn = "abc".replace("b", (s: string) => s);
