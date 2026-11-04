import { cases } from "./cases.ts";

const segmenter = new Intl.Segmenter();
let count = 0;
for (const entry of cases) {
  const input = entry[0];
  let boundaries = "";
  for (const part of segmenter.segment(input)) boundaries += `${part.index},`;
  boundaries += input.length;
  if (boundaries !== entry[1]) throw new Error(`grapheme case ${count}: ${boundaries} != ${entry[1]}`);
  count++;
}
console.log("Unicode 17 grapheme cases", count);
