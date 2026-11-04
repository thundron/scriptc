const boundaries = new Float64Array(3);
const counts = new Uint32Array(3);
const access = {
  set(index, value) {
    boundaries[index] = value;
    counts[index] = value;
  },
  get(index) { console.log(boundaries[index], counts[index]); }
};
access.set(0, 1.25);
access.set("1", 42.5);
access.set(2, -1);
access.get(0);
access.get("1");
access.get(2);
access.set(9, 8);
access.get(9);
access.get("-0");
let order = "";
const key = { toString() { order += "key,"; return "1"; } };
const value = { valueOf() { order += "value,"; return 7.5; } };
access.set(key, value);
console.log(order);
access.get(1);
