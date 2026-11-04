console.log(Number(null), Number(undefined), Number(void 0));

const nil = null;
const missing = undefined;
console.log(Number(nil), Number(missing));

let effects = "";
function value() { effects += "v"; return 7; }
function nullValue() { effects += "n"; return null; }
function undefinedValue() { effects += "u"; return undefined; }
console.log(Number(void value()), effects);
console.log(Number(nullValue()), Number(undefinedValue()), effects);

// The same native coercion applies once JS storage carries checked values.
/** @param {unknown} input */
function numeric(input) { return Number(input); }
console.log(numeric('17'), numeric(true), numeric([]), numeric([3]), numeric({}));
console.log(numeric({ valueOf() { effects += 'c'; return '23'; } }), effects);
try { numeric({ valueOf() { throw new RangeError('numeric hook'); } }); }
catch (error) { console.log(error.name, error.message); }
