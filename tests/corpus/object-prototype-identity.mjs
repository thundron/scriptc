function prototype(value) {
  return Object.getPrototypeOf(value);
}
const plain = { value: 42 };
const bare = Object.create(null);
const child = Object.create(plain);
console.log(prototype(plain) === Object.prototype);
console.log(prototype({ other: true }) === prototype(plain));
console.log(prototype(Object.prototype) === null, prototype(bare) === null);
console.log(prototype([]) === Array.prototype);
console.log(prototype(Array.prototype) === Object.prototype);
console.log(prototype(child) === plain, child.value);
