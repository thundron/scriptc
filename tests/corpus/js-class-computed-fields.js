class Vector { constructor() { this.x = 1; this.y = 2; this.z = 3; } }
const value = new Vector();
let order = '';
function receiver() { order += 'r'; return value; }
function key() { order += 'k'; return 'y'; }
function number() { order += 'v'; return 8; }
receiver()[key()] = number();
console.log(order, value.x, value.y, value.z);
for (const name of ['x', 'z', 'extra']) value[name] = 4;
console.log(value.x, value.z, value.extra);
