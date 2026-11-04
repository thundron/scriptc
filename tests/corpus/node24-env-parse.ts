import { parseEnv } from "node:util";

const samples = [
  "Z=last\nA=first\nZ=replaced\nEMPTY=\n",
  " # heading\nexport NAME = world\nINLINE=value#comment\nSPACES =  two words  \n",
  "SINGLE='a # b\\n c'\nDOUBLE=\"a # b\\n c\"\nTICK=`a # b\\n c`\n",
  "MULTI=\"first\nsecond\" trailing ignored\nNEXT=ok\n",
  "A=one\r\ntwo=three\r\nC='inside\rvalue'\n",
  "invalid line\n=ignored\n  # comment = ignored\nVALID=yes\n",
  "UNCLOSED=\"one\nNEXT=two\nLAST=three",
  "export X=\nexport Y= \n=\n = value\nexport =foo",
  "X=   \nY=foo",
  "__proto__=ignored\nconstructor=own\ntoString=value\n2=two\n10=ten\n1=one",
  "UNICODE=é 😀 你好\n\uFEFFBOM=kept\nNULL=va\0lue\nLONE=\ud800",
  "A=${OTHER}\nB=$OTHER\nC=one=two\nD=\"\\t\\r\\n\"",
  "",
];
for (const sample of samples) {
  const parsed = parseEnv(sample);
  console.log(JSON.stringify(parsed));
  console.log(Object.keys(parsed).join(","));
}
const parsed = parseEnv("HELLO=world");
console.log(parsed.HELLO, parsed.MISSING === undefined);
parsed.HELLO = "changed";
console.log(parsed.HELLO, parseEnv("HELLO=world").HELLO);
