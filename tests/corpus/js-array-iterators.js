function observe(values) {
  console.log([...values.keys()].join(","));
  console.log(JSON.stringify([...values.entries()]));
  console.log([...values.values()].join(","));
  const iterator = values.entries();
  console.log(iterator.next().value.join(":"));
  values.push(9);
  console.log(JSON.stringify([...iterator]));
  console.log(iterator.next().done);
  values.push(10);
  console.log(iterator.next().done);
}
const sparse = new Array(3);
sparse[0] = 1;
sparse[2] = 3;
observe(sparse);
const inherited = new Array(2);
const prototype = Object.create(Array.prototype);
Object.defineProperty(prototype, "0", { get() { console.log("get"); return 4; } });
Object.setPrototypeOf(inherited, prototype);
console.log([...inherited.keys()].join(","));
console.log(JSON.stringify([...inherited.entries()]));
const detached = sparse.entries;
console.log(JSON.stringify([...detached.call(sparse)]));
