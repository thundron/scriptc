const values = JSON.parse('[0,1,2,3]');
let conversions = 0;
const start = { valueOf() { conversions++; return 1; } };
const count = { valueOf() { conversions++; return 2; } };
console.log(values.splice(start, count, 8, 9).join(','));
console.log(values.join(','), conversions);
console.log(values.splice(-1, 0, 7).join(','), values.join(','));

const sealed = JSON.parse('[1,2]');
Object.seal(sealed);
let sealedConversions = 0;
const sealedStart = { valueOf() { sealedConversions++; return 0; } };
console.log(sealed.splice(sealedStart, 1, 3).join(','), sealed.join(','), sealedConversions);

const frozen = JSON.parse('[4,5]');
Object.freeze(frozen);
try { frozen.splice(0, 1); } catch (error) { console.log(error.name); }
console.log(frozen.join(','));
