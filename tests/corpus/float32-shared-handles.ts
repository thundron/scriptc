import {allocateShared,shared,releaseShared,add4,mul} from "@scriptc/experimental/f32";
const earlyWeak = new WeakMap<object,number>();
const handle=allocateShared(8),view=shared(handle);
const lateWeak = new WeakMap<object,number>();
earlyWeak.set(view,1);lateWeak.set(view.buffer,2);
for(let i=0;i<view.length;i++)view[i]=mul(i+0.1,2);
const extra=new Float32Array([1,2,3,4]);
add4(view,2,view,0,extra,0);
console.log("values",Array.from(view).join(","));
console.log("identity",shared(handle)===view,shared(handle).buffer===view.buffer,earlyWeak.get(view),lateWeak.get(shared(handle).buffer));
releaseShared(handle);
view[0]=5;
console.log("retained view",view[0],view.length);
for(const h of [handle,0,-1,0.5,Infinity,NaN]){
 try{shared(h);console.log("unexpected view");}catch(e){console.log(e instanceof RangeError);}
}
try{releaseShared(handle);console.log("unexpected release");}catch(e){console.log(e instanceof RangeError);}
for(const n of [-1,0.5,Infinity,NaN]){
 try{allocateShared(n);console.log("unexpected allocation");}catch(e){console.log(e instanceof RangeError);}
}
for(let i=0;i<4100;i++){const h=allocateShared(0);releaseShared(h);}
try{shared(handle);console.log("stale reused");}catch(e){console.log("still stale",e instanceof RangeError);}
const next=allocateShared(1);const last=shared(next);last[0]=-0;console.log("zero",Object.is(last[0],-0));releaseShared(next);
