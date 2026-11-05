import { lex } from "./lexer.js";

console.log(JSON.stringify(lex(["world", "--loud", "--name=value", "-ab", "-c=value", "-2"])));
