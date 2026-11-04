let calls = 0;
let x;
let y;
function make(value) { calls++; return value; }
const source = { nested: { make } };
const record = { x: 3, y: 7 };
const result = ({ x, y } = make(record));
console.log(calls, x, y, result === record);
({ x, y } = source.nested.make({ x: 11, y: 13 }));
console.log(calls, x, y);
try { ({ x } = make(null)); } catch (error) { console.log(error.name, error.message); }
try { ({ x } = source.nested.make(undefined)); } catch (error) { console.log(error.name, error.message); }
try { ({} = make(undefined)); } catch (error) { console.log(error.name, error.message); }
console.log(calls);
