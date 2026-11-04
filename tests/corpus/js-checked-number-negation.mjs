const input = JSON.parse('[3, -4, 0, -0]');
for (const value of input) console.log(-value, Object.is(-value, -0));
const object = { get() { return JSON.parse('5'); } };
console.log(-object.get());
