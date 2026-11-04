import { styleText } from "node:util";
const stored: typeof styleText = styleText;
console.log(JSON.stringify(stored(["bold", "green"], "hello", {validateStream: false})));
console.log(JSON.stringify(styleText("red", "pipe", {stream: process.stderr})));
const out: NodeJS.WritableStream = process.stdout;
const options = {stream: out};
console.log(JSON.stringify(styleText("blue", "captured", options)));
const boxed: unknown = out;
const restored = boxed as NodeJS.WritableStream;
console.log("round-trip", restored === out);
console.log(JSON.stringify(styleText("green", "restored", {stream: restored})));
function optionalStream(enabled: boolean): NodeJS.WritableStream | undefined {
  return enabled ? out : undefined;
}
for (const enabled of [true, false]) {
  const optional: unknown = optionalStream(enabled);
  const stream = optional as NodeJS.WritableStream | undefined;
  console.log("optional", stream === (enabled ? out : undefined));
  console.log(JSON.stringify(styleText("yellow", "optional", {stream})));
}
const records = [{stream: out}, {stream: restored}];
const boxedRecords: unknown = records;
const restoredRecords = boxedRecords as {stream: NodeJS.WritableStream}[];
for (const record of restoredRecords) {
  console.log("record", record.stream === out);
  console.log(JSON.stringify(styleText("cyan", "record", record)));
}
const identity = (stream: NodeJS.WritableStream): NodeJS.WritableStream => stream;
const boxedIdentity: unknown = identity;
const restoredIdentity = boxedIdentity as typeof identity;
console.log("callback", restoredIdentity(out) === out);
const optionPairs: (NodeJS.WritableStream | undefined)[] = [out, undefined];
const boxedPairs: unknown = optionPairs;
const restoredPairs = boxedPairs as (NodeJS.WritableStream | undefined)[];
for (const stream of restoredPairs) {
  console.log("array", stream === out || stream === undefined);
  console.log(JSON.stringify(styleText("magenta", "array", {stream})));
}
