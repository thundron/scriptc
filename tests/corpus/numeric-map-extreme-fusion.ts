interface Kid {n:number;}
function extremes(kids:Kid[],bounds:Float64Array):string {return Math.min(...kids.map(c=>bounds[c.n*3]!))+":"+Math.max(...kids.map(c=>bounds[c.n*3+1]!));}
console.log(extremes([{n:0},{n:1}],new Float64Array([1,2,3,4,5,6])));
console.log(extremes([],new Float64Array(0)));
function minimum(a:number[]):number{return Math.min(...a.map(x=>x));}
function maximum(a:number[]):number{return Math.max(...a.map(x=>x));}
for(const a of [[0,-0],[-0,0],[-0,-0],[0,0],[Infinity,-Infinity],[NaN,1],[1,NaN]]){const lo=minimum(a),hi=maximum(a);console.log(lo,hi,Object.is(lo,-0),Object.is(hi,-0));}
let calls=0,trace="";
function effect(x:number):number {calls++;trace+=String(x)+",";return x;}
function all(a:number[]):number {return Math.min(...a.map(x=>effect(x)));}
console.log(all([NaN,2,3]),calls,trace);
calls=0;trace="";const holes:number[]=[4];holes.length=4;holes[3]=2;console.log(all(holes),calls,trace);
function mutate(a:number[],x:number,i:number):number {calls++;if(i===0){a[1]=7;a.push(-20);}return x;}
function observed(a:number[]):number {return Math.min(...a.map((x,i,array)=>mutate(array,x,i)));}
calls=0;const mutable=[4,5,6];console.log(observed(mutable),calls,mutable.join(","));
function shrink(a:number[],x:number,i:number):number {calls++;if(i===0)a.length=1;return x;}
function shortened(a:number[]):number {return Math.max(...a.map((x,i,array)=>shrink(array,x,i)));}
calls=0;const shorter=[4,5,6];console.log(shortened(shorter),calls,shorter.length);
function fail(x:number):number {calls++;if(x===2)throw new Error("mapped");return x;}
function throwing(a:number[]):number {return Math.min(...a.map(x=>fail(x)));}
calls=0;try{console.log(throwing([NaN,2,3]));}catch(e){console.log((e as Error).message,calls);}
