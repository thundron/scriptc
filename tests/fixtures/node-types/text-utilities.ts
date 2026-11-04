import { stripVTControlCharacters, toUSVString } from "node:util";

const strip: (value: string) => string = stripVTControlCharacters;
const usv: (value: string) => string = toUSVString;
console.log(strip("\u001b[32mtyped\u001b[0m"));
console.log(JSON.stringify(usv("\ud800😀\udfff")));
