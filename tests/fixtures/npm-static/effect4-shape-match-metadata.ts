const match = "😀prefix/hello".match(/(\/hello)/);
if (match) console.log(match.index, match.input, JSON.stringify(match));
const exec = /(world)/.exec("hello world");
if (exec) console.log(exec.index, exec.input, exec[1]);
console.log("no match".match(/missing/) === null);
const owner = new ArrayBuffer(16);
const view = new Uint8Array(owner, 4, 8);
view[0] = 42;
console.log(view instanceof Uint8Array, new DataView(owner) instanceof Uint8Array, new Uint8Array(owner)[4]);
