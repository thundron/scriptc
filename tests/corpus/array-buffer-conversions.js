let order = "";
function offset(value) {
  return { valueOf() { order += "o"; return value; } };
}
function length(value) {
  return { valueOf() { order += "l"; return value; } };
}
const buffer = new ArrayBuffer(8);
for (const n of [-1, 1, 8, 12, Infinity]) {
  order = "";
  try {
    // @ts-expect-error Numeric inputs use the JavaScript coercion protocol.
    const view = new Uint32Array(buffer, offset(n), length(0));
    console.log(view.byteOffset, view.length);
  } catch (error) {
    if (error instanceof Error) console.log(error.name);
  }
  console.log(order);
}
for (const n of [-1, 1, 9]) {
  order = "";
  try {
    // @ts-expect-error Numeric inputs use the JavaScript coercion protocol.
    const view = new DataView(buffer, offset(n), length(0));
    console.log(view.byteOffset, view.byteLength);
  } catch (error) {
    if (error instanceof Error) console.log(error.name);
  }
  console.log(order);
}
order = "";
// @ts-expect-error Extra arguments are evaluated but ignored for array inputs.
const copied = new Uint32Array([5, 6], offset(-1), length(-1));
console.log(copied.length, copied[0], copied[1], order);
// @ts-expect-error Extra arguments are evaluated but ignored for length inputs.
const allocated = new Uint8Array(3, offset(-1), length(-1));
console.log(allocated.length, order);
