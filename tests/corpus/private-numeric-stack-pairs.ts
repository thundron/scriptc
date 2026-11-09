function pairs(n:number,initial:number):number {const a:number[]=[];let sum=0;for(let i=0;i<n;i++){a.push(initial+i);sum+=a.pop()!;}return sum;}
for(const x of [0,-0,1.5,NaN,Infinity,-Infinity])console.log(pairs(20,x));
function one(x:number):number|undefined {const a:number[]=[];a.push(x);return a.pop();}
console.log(Object.is(one(-0),-0),Number.isNaN(one(NaN)),one(7));
let order="";
function pushValue():number {order+="v";return 4;}
function consume(x:number|undefined):number {order+="c";return x??1;}
function effects():number {const a:number[]=[];a.push(pushValue());return consume(a.pop());}
console.log(effects(),order);
function observer():number {const a:number[]=[];a.push(3);const x=a.length;const v=a.pop();return x+v!;}
console.log(observer());
function conditional(flag:boolean):string {const a:number[]=[];a.push(3);const value=flag?a.pop():undefined;return a.length+":"+String(value);}
console.log(conditional(false),conditional(true));
function unbalanced():string {const a:number[]=[];a.push(1);a.push(2);const x=a.pop();return a.length+":"+x;}
console.log(unbalanced());
function escaping():number[] {const a:number[]=[];a.push(3);return a;}
console.log(escaping().join(","));
function missing(index:number):number|undefined {const input=new Float64Array(0);const a:number[]=[];a.push(input[index]!);return a.pop();}
console.log("missing",missing(0),missing(1));
