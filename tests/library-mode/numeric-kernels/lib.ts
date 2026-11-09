export function two(x: number, y: number): number { return Math.hypot(x,y); }
export function three(x: number, y: number, z: number): number { return Math.hypot(x,y,z); }
export function literal(x: number, index: number): number { const a=[x,-0,NaN];return a[index] ?? -1; }
export function product(n: number, initial: number): number { let t=initial;for(let i=0;i<n;i++) t*=6;return t; }
export function run(seed: number, n: number): number {
  const scratch=new Float64Array(16);
  let total=0;
  for(let i=0;i<n;i++) {
    scratch.fill(seed+i*0.25);
    const a=[seed+i,2,3];a[1]=i%7;
    total+=Math.hypot(a[0]!,a[1]!,a[2]!)+scratch[15]!;
  }
  return total;
}
export function mapSum(x:number):number {const a=[0,1,2].map((v,i)=>x+v+i);return a[0]!+a[1]!+a[2]!;}
export function stackSum(n:number,x:number):number {const a:number[]=[];let sum=0;for(let i=0;i<n;i++){a.push(x+i);sum+=a.pop()!;}return sum;}
export function grow(n:number):number {const a:number[]=[];for(let i=0;i<n;i++)a.push(i);return a.length+(a[n-1]??0);}
const cache:{x:number;y:number;z:number}[]=[];
export function allocations(n:number):number {cache.length=0;for(let i=0;i<n;i++)cache.push({x:i,y:i+1,z:i+2});let sum=0;for(const node of cache)sum+=node.x+node.y+node.z;return sum;}
export function direct(x:number,index:number):number {return [x,-0,NaN][index]??-1;}
export function triples(n:number):number {const s=[0,0,n];let sum=0;while(s.length){const hi=s.pop()!,lo=s.pop()!,node=s.pop()!;sum+=hi+lo+node;if(hi>1)s.push(node+1,lo,hi-1,node+2,lo,1);}return sum;}
export function extremes(n:number,x:number):number {const kids:{n:number}[]=[];for(let i=0;i<n;i++)kids.push({n:i});return Math.min(...kids.map(c=>c.n+x))+Math.max(...kids.map(c=>c.n-x));}
export function affine(n:number):number {const a=new Float64Array(300);for(let i=0;i<a.length;i++)a[i]=i;let sum=0;for(let t=0;t<n;t++){const base=t*3;sum+=a[base+1]!;}return sum;}
class Entry {x:number;child:Entry|undefined;constructor(x:number){this.x=x;}}
const entries:Entry[]=[];
export function recycled(n:number):number {entries.length=0;let sum=0;for(let i=0;i<n;i++){const entry=new Entry(i);if(i%2===0)entry.child=new Entry(i+2);entries.push(entry);}for(const entry of entries)sum+=entry.x+(entry.child?.x??-1);return sum;}
export function closed(n:number,x:number):number {const values=new Float64Array(32);for(let i=0;i<32;i++)values[i]=x+i;const pick=(j:number):[number,number]=>{let best=Infinity,at=-1;for(let k=0;k<j;k++){const value=values[k]!;if(value<best){best=value;at=k;}}return [best,at];};let sum=0;for(let i=1;i<n;i++){const [best,at]=pick(i);sum+=best+at;}return sum;}
