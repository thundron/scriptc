function append(a:number[],x:number):number {return a.push(x,x+1,x+2,x+3,x+4,x+5);}
for(const x of [-0,2,1.25,NaN,Infinity,2147483648]) {const a=[-7,-8];console.log(append(a,x),a.join(","));console.log(a.pop(),a.pop(),a.pop(),a.length);}
const sparse:number[]=[];sparse.length=1048577;console.log(append(sparse,7),sparse[1048576],sparse[1048577],sparse[1048582]);console.log(sparse.pop(),sparse.pop(),sparse.length);
let target=[8,9];const saved=target;console.log(target.push((target=[],1),2,3,4,5,6),target.length,saved.join(","));
let trace="";
function value(a:number[],n:number):number {trace+="v"+n;if(n===2)a.pop();return n;}
const effects=[7,8];console.log(effects.push(value(effects,1),value(effects,2),value(effects,3)),effects.join(","),trace);
interface Cell {n:number;}
function refs(a:Cell[],x:Cell,y:Cell):number {return a.push(x,y,x,y,x,y);}
const first={n:1},second={n:2},cells:Cell[]=[];console.log(refs(cells,first,second));first.n=9;console.log(cells.map(c=>c.n).join(","),cells[0]===cells[2]);
function flags(a:boolean[]):number{return a.push(true,false,true,false,true,false);}
const booleans:boolean[]=[];console.log(flags(booleans),booleans.join(","));
function triples(n:number):number {const stack=[0,0,n];let sum=0;while(stack.length){const hi=stack.pop()!,lo=stack.pop()!,node=stack.pop()!;sum+=hi+lo+node;if(hi>1)stack.push(node+1,lo,hi-1,node+2,lo,1);}return sum;}
console.log(triples(8),triples(0),triples(1));
function unbalanced():number {const s=[1,2];let sum=0;while(s.length){const a=s.pop(),b=s.pop(),c=s.pop();sum+=(a??7)+(b??7)+(c??7);}return sum;}
function caught():number {const s=[1,2,3];let sum=0;try{while(s.length){const a=s.pop(),b=s.pop(),c=s.pop();sum+=(a??7)+(b??7)+(c??7);}}catch{return -1;}return sum;}
function alias():number {const s=[1,2,3],other=s;let sum=0;while(other.length){const a=s.pop(),b=s.pop(),c=s.pop();sum+=(a??7)+(b??7)+(c??7);}return sum;}
console.log(unbalanced(),caught(),alias());
