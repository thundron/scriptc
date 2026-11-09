function multiply(n:number, initial:number, factor:number):number {
  let t=initial;
  for(let i=0;i<n;i++) t*=factor;
  return t;
}
function six(n:number, initial:number):number {
  let t=initial;for(let i=0;i<n;i++)t*=6;return t;
}
function negative(n:number, initial:number):number {
  let t=initial;for(let i=0;i<n;i++)t*=-3;return t;
}
function left(n:number, initial:number):number {
  let t=initial;for(let i=0;i<n;i++)t=7*t;return t;
}
const starts=[0,-0,1,-1,1.25,-1.25,NaN,Infinity,-Infinity,4294967295,1501199875790165,1501199875790166,Number.MAX_SAFE_INTEGER,2**53];
for(const initial of starts) for(let n=0;n<5;n++) {
  const a=six(n,initial),b=negative(n,initial),c=left(n,initial);
  if(!Object.is(a,multiply(n,initial,6)) || !Object.is(b,multiply(n,initial,-3)) || !Object.is(c,multiply(n,initial,7)))throw new Error("constant product mismatch");
  console.log(a,Object.is(a,-0),b,Object.is(b,-0),c);
}
function gather(ids:Uint32Array, values:Float64Array):number {
  let total=0;
  for(let i=0;i<ids.length;i++) {const t=ids[i]!;total+=values[t*6] ?? 13;}
  return total;
}
console.log(gather(new Uint32Array([0,1,2,715827883,0xffffffff]),new Float64Array([2,0,0,0,0,0,3,0,0,0,0,0,5])));
