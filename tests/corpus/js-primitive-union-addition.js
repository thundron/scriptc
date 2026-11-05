const table = ['a', 'b'];
function pair(i = 0, j = 0) { return table[i] + table[j]; }
function chain(i = 0, j = 0, k = 0) { return table[i] + table[j] + table[k]; }
console.log(pair(0, 1), pair(0, 4), pair(4, 0), pair(4, 5));
console.log(chain(0, 1, 0), chain(4, 5, 0), chain(4, 5, 6));
console.log(chain(0, 4, 1));
let calls = 0;
function take(i = 0) { calls++; return table[i]; }
console.log(take(4) + take(5) + take(0), calls);
