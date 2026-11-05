function recover(error) { return error.message; }
const error = new Error('failed');
console.log(await Promise.reject(error).catch(recover));
function accept(value) { return value; }
console.log(await Promise.resolve(7).catch(recover));
console.log(await Promise.resolve().then(() => {}).catch(recover));
try { await Promise.reject(error).catch(undefined); }
catch (caught) { console.log(caught === error); }
console.log(await Promise.reject(2).catch(value => Promise.resolve(value + 3)));
