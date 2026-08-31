import { posix } from "node:path";

console.log("a\r\nb\r\n".replaceAll("\r\n", "\n") === "a\nb\n");
console.log("aba".replaceAll("a", "[$&][$`][$']"));
console.log("a-a".replaceAll("a", "$$"));
console.log("café café".replaceAll("café", "x"));
console.log("unchanged".replaceAll("missing", "x"));
console.log(posix.basename("dist/build/app.wasm"));
console.log(posix.basename("/tmp/name.txt", ".txt"));
