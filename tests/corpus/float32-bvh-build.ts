import {allocateShared,shared,releaseShared} from "@scriptc/experimental/f32";
import {build} from "../library-mode/float32-bvh/lib.ts";
const count=128,input=allocateShared(count*12),output=allocateShared((count*2-1)*16);
const triangles=shared(input);let state=12345;
for(let i=0;i<triangles.length;i++){state=(Math.imul(state,1664525)+1013904223)>>>0;triangles[i]=i%4===3?0:(state/4294967296)*200-100;}
console.log("area",build(input,0,count,output,0));
const nodes=shared(output),words=new Uint32Array(nodes.buffer);let hash=0;
for(let i=0;i<words.length;i++)hash=(Math.imul(hash,31)+words[i])|0;
console.log("tree",words[15],words[12],words[13],hash);
console.log("buffer identity",nodes.buffer===shared(output).buffer);
console.log("root",nodes.slice(0,12).join(","));
for(let i=0;i<count-1;i++){const p=i*16,l=words[p+12]*16,r=words[p+13]*16;for(let a=0;a<3;a++)if(nodes[p+a]!==Math.min(nodes[l+a],nodes[r+a])||nodes[p+4+a]!==Math.max(nodes[l+4+a],nodes[r+4+a]))throw new Error("invalid parent bounds");}
releaseShared(input);releaseShared(output);
