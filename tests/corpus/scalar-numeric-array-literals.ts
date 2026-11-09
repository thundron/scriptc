function literal(x:number,index:number):number|undefined {
  const a=[x,-0,NaN];return a[index];
}
for(const index of [-0,0,1,2,3,-1,0.5,Infinity,NaN]) {
  const x=literal(7,index);console.log(x,Object.is(x,-0));
}
let order="";
function value(name:string,x:number):number {order+=name;return x;}
function effects(index:number):number|undefined {
  const a=[value("a",1),value("b",2),value("c",3)];
  return a[value("i",index)];
}
console.log(effects(2),order);order="";console.log(effects(10),order);
function alias(x:number):number {
  const a=[x,x+1,x+2];const b=a;b[0]=42;return a[0]!;
}
function mutate(x:number,i:number):number {
  const a=[x,x+1,x+2];a[i]=9;return a.length;
}
function captured(x:number):()=>number[] {const a=[x,x+1,x+2];return ()=>a;}
function length(x:number):number {const a=[x,x+1,x+2];return a.length;}
function keep(x:number):number[] {const a=[x,x+1,x+2];return a;}
function identity(x:number):boolean {const a=[x,x+1,x+2],b=[x,x+1,x+2];return a===b;}
console.log(alias(3),mutate(3,5),length(2),identity(2),captured(3)().join(","));
const a=keep(1),b=keep(1);console.log(a!==b,a.join(","));
function conditional(x:boolean):number {let a=[0];if(x){a=[1,2,3];}return a.length;}
console.log(conditional(true),conditional(false));
function throwing():number {throw new Error("initializer");}
function abrupt():number {const a=[value("first",1),throwing(),value("last",3)];return a.length;}
order="";try {abrupt();} catch {console.log(order);}
function loops(n:number):number {
  let total=0;
  for(let i=0;i<n;i++) {const a=[i,i+1,i+2];a[0]=-i;total+=a[i%3]!;}
  return total;
}
console.log(loops(11));
function missing(index:number):number|undefined {const source=new Float64Array(0);const a=[source[index]!,1,2];return a[0];}
console.log("missing",missing(0),missing(1));
