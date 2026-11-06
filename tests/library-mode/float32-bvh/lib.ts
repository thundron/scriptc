import {shared,min4,max4,add4,mul4,add,sub,mul} from "@scriptc/experimental/f32";

// A balanced bounding-volume hierarchy, not an application/native addon.
// Input: three padded xyz vertices (12 floats) per triangle.
// Output: heap-ordered nodes, 16 words each: min4, max4, center4,
//         left/right child indices, first primitive and primitive count.
const halves = new Float32Array([0.5,0.5,0.5,0.5]);
export function build(inputHandle:number,first:number,count:number,outputHandle:number,offset:number):number {
  const input=shared(inputHandle),output=shared(outputHandle);
  if(count<1||count>1048576||Math.floor(count)!==count||(count&(count-1))!==0||first<0||Math.floor(first)!==first||offset<0||Math.floor(offset)!==offset||input.length<(first+count)*12||output.length<offset+(count*2-1)*16)
    throw new RangeError("invalid BVH buffer span or leaf count");
  const words=new Uint32Array(output.buffer);
  const leaf=count-1;
  let areaSum=0;
  for(let i=0;i<count;i++){
    const p=(first+i)*12,node=offset+(leaf+i)*16;
    min4(output,node,input,p,input,p+4);
    min4(output,node,output,node,input,p+8);
    max4(output,node+4,input,p,input,p+4);
    max4(output,node+4,output,node+4,input,p+8);
    add4(output,node+8,output,node,output,node+4);
    mul4(output,node+8,output,node+8,halves,0);
    words[node+12]=0xffffffff;words[node+13]=0xffffffff;
    words[node+14]=first+i;words[node+15]=1;
    const x=sub(output[node+4],output[node]),y=sub(output[node+5],output[node+1]),z=sub(output[node+6],output[node+2]);
    areaSum=add(areaSum,mul(2,add(add(mul(x,y),mul(y,z)),mul(z,x))));
  }
  for(let i=leaf-1;i>=0;i--){
    const node=offset+i*16,left=i*2+1,right=left+1,l=offset+left*16,r=offset+right*16;
    min4(output,node,output,l,output,r);
    max4(output,node+4,output,l+4,output,r+4);
    add4(output,node+8,output,node,output,node+4);
    mul4(output,node+8,output,node+8,halves,0);
    words[node+12]=left;words[node+13]=right;
    words[node+14]=words[l+14];words[node+15]=words[l+15]+words[r+15];
  }
  return areaSum;
}
