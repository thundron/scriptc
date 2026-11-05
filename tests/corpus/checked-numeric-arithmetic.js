function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b) { return a / b; }
function remainder(a, b) { return a % b; }
function power(a, b) { return a ** b; }
console.log(subtract(12, 5), subtract(12n, 5n), subtract("12", true));
console.log(multiply(12, 5), multiply(12n, 5n), multiply(null, 5));
console.log(divide(12, 5), divide(12n, 5n), divide("12", 4));
console.log(remainder(12, 5), remainder(12n, 5n), remainder(-12, 5));
console.log(power(2, 5), power(2n, 5n), power(1, Infinity), power(-1, NaN));
console.log(1 / divide(-0, 1), Number.isNaN(subtract(undefined, 1)));
let order = "";
const left = { valueOf() { order += "L"; return 9n; } };
const right = { valueOf() { order += "R"; return 2n; } };
console.log(subtract(left, right), order);
for (const fn of [subtract, multiply, divide, remainder, power]) {
  try { fn(1n, 1); } catch (error) { console.log(error.name, error.message); }
}
try { divide(1n, 0n); } catch (error) { console.log(error.name, error.message); }
try { remainder(1n, 0n); } catch (error) { console.log(error.name, error.message); }
try { power(1n, -1n); } catch (error) { console.log(error.name, error.message); }
