function choose(a:Float64Array,n:number):number {const pick=(j:number):[number,number]=>{let best=Infinity,at=-1;for(let k=0;k<j;k++){const v=a[k]??Infinity;if(v<best){best=v;at=k;}}return [best,at];};let total=0;for(let i=1;i<n;i++){const [best,at]=pick(i);total+=best+at;}return total;}
for(const n of [-1,0,1,3,5])console.log(choose(new Float64Array([7,4,2,9]),n));
function mutable():string {let offset=2;const f=(x:number):[number,number]=>{const first=offset+x;return [first,offset];};const [a,b]=f((offset=7,3));offset=-5;const [c,d]=f(2);return [a,b,c,d].join(",");}
console.log(mutable());
function writing():number {let counter=0;const f=(x:number):[number,number]=>{counter+=x;return [counter,x];};const [a,b]=f(3),[c,d]=f(4);return a+b+c+d+counter;}
console.log(writing());
function identities(x:number):boolean {const f=(v:number):[number,number]=>[v+x,v],saved=f;const [a,b]=f(2);const one=f(3),two=f(3);return saved===f && one===one && one!==two && a+b===x+4;}
console.log(identities(8));
function shadow(x:number):number {const f=(n:number):[number,number]=>[x+n,n];{const x=9;const [a,b]=f(2);return a+b+x;}}
console.log(shadow(3));
function fields():number {const state={n:1};const f=(x:number):[number,number]=>{state.n+=x;const n=state.n;return [n,n+1];};const [a,b]=f(2),[c,d]=f(3);return a+b+c+d+state.n;}
console.log(fields());
let trace="";
function throwing(x:number):string {const f=(n:number):[number,number]=>{trace+="f";if(n<0)throw new Error("tuple");return [n,-0];};try{const [a,b]=f(x);return String(a)+":"+Object.is(b,-0);}catch(e){return (e as Error).message;}}
console.log(throwing(2),throwing(-1),trace);
const buffer=new Float64Array([1]);
function update():number {buffer[0]=7;return 2;}
function argumentsFirst():number {const f=(x:number):[number,number]=>{const value=buffer[0]!;return [value+x,value];};const [a,b]=f(update());return a+b;}
console.log(argumentsFirst());
function make(x:number):(n:number)=>[number,number] {const f=(n:number):[number,number]=>{const first=x+n;return [first,x];};const [a,b]=f(1);console.log(a,b);return f;}
const escaped=make(3);console.log(escaped(5).join(","));
function special(x:number):[number,number] {const f=(n:number):[number,number]=>{if(n<0)return [-0,NaN];let v=x;for(let i=0;i<n;i++)v+=0;return [v,n];};const [a,b]=f(-1);console.log(Object.is(a,-0),Number.isNaN(b));const [c,d]=f(0);return [c,d];}
for(const x of [-0,NaN,Infinity,-Infinity,1.25]){const a=special(x);console.log(a[0],a[1],Object.is(a[0],-0));}
