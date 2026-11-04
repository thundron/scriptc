import { EventEmitter } from "node:events";

const emitter = new EventEmitter();
const box = { label: "record" };
const bytes = Buffer.from("buffer");
const values = [2, 3];
let nested = false;
function listener(a: number, b: string, c: boolean, d: { label: string }, e: Buffer, f: number[], g: number): string {
  console.log("long", a, b, c, d.label, e.toString(), f.join(":"), g);
  if (!nested) {
    nested = true;
    emitter.emit("tuple", 8, "inner", false, box, bytes, values, 9);
  }
  return b + d.label;
}
emitter.on("tuple", listener);
emitter.once("tuple", (a: number, b: string, c: boolean, d: { label: string }, e: Buffer) => {
  console.log("prefix", a, b, c, d.label, e.toString());
});
emitter.on("tuple", () => { console.log("empty"); });
console.log("identity", emitter.listenerCount("tuple", listener));
console.log("emit", emitter.emit("tuple", 1, "outer", true, box, bytes, values, 7));
emitter.off("tuple", listener);
console.log("remaining", emitter.listenerCount("tuple"));
emitter.emit("tuple", 10, "last", true, box, bytes, values, 11);

emitter.on("throwing", (a: number, b: string, c: boolean, d: Buffer, e: number[]) => {
  console.log("throw", a, b, c, d.toString(), e.length);
  throw new Error("listener failed");
});
try {
  emitter.emit("throwing", 1, "error", true, bytes, values);
} catch (error) {
  console.log((error as Error).message);
}
console.log(box.label, bytes.toString(), values.join(":"));
