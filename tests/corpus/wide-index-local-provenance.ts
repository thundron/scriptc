function affine(a:Float64Array,n:number):number {let sum=0;for(let t=0;t<n;t++){const base=t*3;sum+=a[base+1]!;}return sum;}
console.log(affine(new Float64Array([1,2,3,4,5,6]),2));
function products(a:Float64Array,ids:Uint32Array):string {let out="";for(let i=0;i<ids.length;i++){const t=ids[i]!,base=t*3;out+=a[base]+":"+a[base+1]+",";}return out;}
console.log(products(new Float64Array([11,13,17,19,23,29]),new Uint32Array([0,1,1431655766,2147483648,4294967295])));
function cancellation(a:Float64Array):string {let out="";for(let t=4503599627370494;t<4503599627370498;t++){const base=t*3;out+=base+":"+a[(base+1)-base]+",";}return out;}
console.log(cancellation(new Float64Array([17,23,31,37])));
function signed(a:Float64Array):string {let out="";for(let t=-3;t<3;t++){const base=t*-3;out+=a[base]+":"+a[base+1]+",";}return out;}
console.log(signed(new Float64Array([2,3,5,7,11,13,17,19,23,29,31])));
function authoritative(a:Float64Array):string {let out="";for(let t=4503599627370494;t<4503599627370498;t++){const base=t*3;out+=String(base|0)+":"+a[((base+1)-base)|0]+",";}return out;}
console.log(authoritative(new Float64Array([17,23,31,37])));
