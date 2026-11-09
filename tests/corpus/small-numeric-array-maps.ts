let order = "";
function value(name:string,x:number):number {order+=name;return x;}
function callback(): (x:number,index:number)=>number {order+="f";return (x,index)=>{order+="m"+index;return x+index;};}
function mapped(x:number):number {const a=[value("a",x),value("b",x+1),value("c",x+2)].map(callback());return a[0]!+a[1]!+a[2]!;}
console.log(mapped(10),order);
function scalar(x:number):number {const a=[0,1,2].map((v,i)=>Math.hypot(x+v,i));return a[0]!+a[1]!+a[2]!;}
console.log(scalar(3));
function escaped(x:number):number[] {return [x,2,3].map(v=>v*2);}
const a=escaped(1),b=escaped(1);console.log(a!==b,a.join(","));
const observed=[1,2,3].map((v,i,source)=>{if(i===0){source[2]=9;source.push(20);}return v+source.length;});console.log(observed.join(","));
let calls=0;
try {const a=[1,2,3].map(v=>{calls++;if(v===2)throw new Error("stop");return v;});console.log(a);} catch {console.log("thrown",calls);}
const special=[NaN,-0,Infinity].map(v=>v);console.log(Number.isNaN(special[0]),Object.is(special[1],-0),special[2]);
const sparse=[1,,3];console.log(sparse.map(v=>v!+1).join(","));
function arrayCallback(x:number[]):number {return x.length;}
console.log([1,2,3].map((_v,_i,source)=>arrayCallback(source)).join(","));
