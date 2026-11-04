function exercise(value) {
  console.log(value.length, value.byteLength, value.byteOffset, value.at(-1), value.at("1"));
  const view = value.subarray(1);
  const copy = value.slice(1);
  console.log(view.buffer === value.buffer, copy.buffer === value.buffer);
  value.set(new Int8Array([-1, 127]), 1);
  console.log(String(value), String(view), String(copy));
  console.log(value.fill(3.5, "0", 1) === value);
  console.log(value.copyWithin(2, 0, 2) === value);
  console.log(value.join("|"), value.toString());
  console.log(value.join({ toString() { return ":"; } }));
  console.log(JSON.stringify(Object.values(value)), JSON.stringify(Object.entries(value)));
  console.log([...value].join(","));
  const [first, second] = value;
  console.log(first, second);
  try { value.set([1, 2], 4); } catch (e) { console.log(e.name, e.message); }
}
exercise(new Int8Array([1, 2, 3, 4]));
exercise(new Uint16Array([1, 2, 3, 4]));
exercise(new Int16Array([1, 2, 3, 4]));
exercise(new Uint8ClampedArray([1, 2, 3, 4]));
exercise(new Float32Array([1.25, 2.5, 3.75, 4]));

// OpenTUI's color constructor copies a narrow view held in an untyped field.
class Color {
  buffer;
  constructor(buffer) {
    this.buffer = new Uint16Array(4);
    this.buffer.set(buffer.subarray(0, 4));
  }
}
const color = new Color(new Uint16Array([65535, 32768, 255, 1, 99]));
console.log(String(color.buffer), color.buffer instanceof Uint16Array);
