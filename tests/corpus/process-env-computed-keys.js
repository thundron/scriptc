const name = JSON.parse('"SCRIPTC_COMPUTED_ENV"');
process.env[name] = "first";
console.log(process.env[name]);
process.env[name] = "second";
console.log(process.env.SCRIPTC_COMPUTED_ENV);
delete process.env[name];
console.log(process.env[name] === undefined);
process.env[918273] = "number";
process.env[true] = "boolean";
console.log(process.env[918273], process.env[true]);
delete process.env[918273];
delete process.env[true];
console.log(process.env[918273] === undefined, process.env[true] === undefined);
let calls = 0;
function key() { calls++; return name; }
process.env[key()] = "once";
console.log(process.env[key()], calls);
delete process.env[key()];
console.log(calls);
const objectKey = JSON.parse('{}');
objectKey.toString = () => { calls++; return "SCRIPTC_COERCED_ENV"; };
process.env[objectKey] = "coerced";
console.log(process.env[objectKey], calls);
delete process.env[objectKey];
objectKey.toString = () => { throw new Error("key failed"); };
try { console.log(process.env[objectKey]); }
catch (error) { console.log(error.message, calls); }
