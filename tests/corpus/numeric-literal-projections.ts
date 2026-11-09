function direct(x:number,y:number,z:number,i:number):number { return [x,y,z][i] ?? 99; }
function named(x:number,y:number,z:number,i:number):number { const a=[x,y,z];return a[i] ?? 99; }
for(const i of [-Infinity,-1,-0,0,0.5,1,2,3,NaN,Infinity,4294967296,9007199254740991]) {
  const a=direct(-0,NaN,7,i),b=named(-0,NaN,7,i);
  console.log(i,a,b,Object.is(a,-0),Object.is(b,-0));
}
let trace="";
function item(n:number):number {trace+="v"+n;return n===0?-0:n;}
function index(n:number):number {trace+="i"+n;return n;}
for(const i of [0,2,9,NaN]) {trace="";const value=[item(0),item(1),item(2)][index(i)];console.log(value,Object.is(value,-0),trace);}
function missing(i:number):number {return ([] as number[])[index(i)] ?? 123;}
console.log(missing(0),missing(-0));
function optional(i:number):number|undefined {return [1,NaN,-0][i];}
for(const i of [0,1,2,3,-1]) {const result=optional(i);console.log(result,Object.is(result,-0));}
function saved(i:number):number {const a=[2,4,6];const value=a[i];return value??-1;}
console.log(saved(1),saved(3));
function throws(n:number):number {trace+="t"+n;if(n===2)throw new Error("element");return n;}
trace="";try{console.log([throws(1),throws(2),throws(3)][index(0)]);}catch(e){console.log((e as Error).message,trace);}
function badIndex():number {trace+="index";throw new Error("index");}
trace="";try{console.log([throws(0),throws(1)][badIndex()]);}catch(e){console.log((e as Error).message,trace);}
function absent(a:Float64Array,i:number):number {return [a[i]!][0]??321;}
console.log(absent(new Float64Array([NaN,-0]),0),Object.is(absent(new Float64Array([NaN,-0]),1),-0),absent(new Float64Array(0),0));
