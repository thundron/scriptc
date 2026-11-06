import {add,allocateShared,shared,releaseShared,add4} from "@scriptc/experimental/f32";
import * as f32 from "@scriptc/experimental/f32";
const plus=add,multiply=f32["mul"],vector=add4;
function apply(fn:(a:number,b:number)=>number,a:number,b:number):number{return fn(a,b);}
console.log("functions",plus(1.1,2.2),apply(multiply,1.1,2.2),[0.1,0.2,0.3].map(v=>plus(v,0.1)).join(","));
const create=allocateShared,view=shared,release=releaseShared;
const handle=create(4),data=view(handle),input=new Float32Array([1,2,3,4]);
vector(data,0,input,0,input,0);console.log("vector",Array.from(data).join(","));release(handle);
function shadow(add:(a:number,b:number)=>number){return add(5,2);}
console.log("shadow",shadow((a,b)=>a-b));
const object={add(a:number,b:number){return a-b;}};
console.log("object",object.add(5,2));
console.log("metadata",plus.name,plus.length,multiply.name,multiply.length,vector.name,vector.length);
