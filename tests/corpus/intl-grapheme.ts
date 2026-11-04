const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const input = "Ae\u0301👩🏽‍💻🇺🇸🇨🇦\r\nक्\u200dष각Z";
const segments = segmenter.segment(input);
for (const { segment, index, input: original } of segments) {
  console.log(JSON.stringify(segment), index, original === input);
}
let text = "";
for (const part of segments) text += part.segment;
console.log(text === input, Array.isArray(segments), segments === segments);
console.log(segmenter.segment("") === segmenter.segment(""));
for (const position of [-1, 0, 1, 2, 3, 4, 8, 9, 10, 11, input.length - 1, input.length, NaN, Infinity]) {
  const result = segments.containing(position);
  console.log(position, result === undefined ? "none" : `${result.index}:${result.segment}`);
}
let empty = 0;
for (const part of segmenter.segment("")) empty += part.segment.length;
console.log("empty", empty);
let order = "";
function undef(value: string): undefined {
  order += value;
  return undefined;
}
const another = new Intl.Segmenter(undef("a"), undef("b"));
for (const part of another.segment("x")) console.log(part.segment, order);
