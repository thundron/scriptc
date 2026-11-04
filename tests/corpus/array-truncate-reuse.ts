const numbers: number[] = [];
const strings: string[] = [];
for (let i = 0; i < 4096; i++) {
  numbers.push(i);
  strings.push("value:" + i);
}
numbers.length = 2;
strings.length = 2;
console.log(JSON.stringify(numbers), JSON.stringify(strings));
for (let i = 0; i < 32; i++) {
  numbers.length = 0;
  strings.length = 0;
  numbers.push(i);
  strings.push("new:" + i);
  if (i % 8 === 0) console.log(JSON.stringify(numbers), JSON.stringify(strings));
}
numbers.length = 8;
strings.length = 8;
console.log(JSON.stringify(numbers), JSON.stringify(strings));
numbers[7] = 42;
strings[7] = "last";
numbers.length = 4;
strings.length = 4;
numbers.length = 8;
strings.length = 8;
console.log(JSON.stringify(numbers), JSON.stringify(strings));
numbers[2 ** 24] = 99;
strings[2 ** 24] = "sparse";
numbers.length = 1;
strings.length = 1;
console.log(JSON.stringify(numbers), JSON.stringify(strings));
