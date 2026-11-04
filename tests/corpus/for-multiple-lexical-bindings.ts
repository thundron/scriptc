const callbacks: (() => string)[] = [];
for (let index = 0, label = "a"; index < 3; index++, label += "x") {
  callbacks.push(() => index + ":" + label);
  if (index === 1) continue;
  console.log("loop", index, label);
}
for (const callback of callbacks) console.log(callback());

let fromInitializer: () => number = () => -1;
for (let index = 0, limit = (fromInitializer = () => index, 3); index < limit; index++) {
  index++;
  console.log("initial", fromInitializer(), "current", index);
}
console.log("after", fromInitializer());

let outer = "outer";
for (let outer = "inner", count = 0; count < 1; count++) {
  console.log(outer);
  break;
}
console.log(outer);
