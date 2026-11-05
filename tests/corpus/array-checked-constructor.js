function make(size) {
  const out = new Array(size);
  console.log(out.length, typeof out[0]);
  for (let i = 0; i < out.length; i++) out[i] = i % 2 === 0 ? i : "item";
  return out;
}
console.log(JSON.stringify(make(4)));
console.log(JSON.stringify(make(0)));
function from(value) {
  const out = new Array(value);
  if (typeof value === "number") for (let i = 0; i < out.length; i++) out[i] = i;
  return out;
}
console.log(JSON.stringify(from("value")));
console.log(JSON.stringify(from(3)));
try { from(-1); } catch (error) { console.log(error.name, error.message); }
try { from(1.5); } catch (error) { console.log(error.name, error.message); }

function remove(size) {
  const out = new Array(size);
  out[1] = "middle";
  console.log(out.pop(), out.length);
  console.log(out.shift(), out.length);
  console.log(out.pop(), out.length);
  console.log(out.pop(), out.shift(), out.length);
  out.push({ value: 42 });
  console.log(out.shift().value, out.length);
  out.push(undefined);
  console.log(out.pop(), out.length);
}
remove(3);
