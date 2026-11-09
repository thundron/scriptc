function append(n:number):number[] {const a:number[]=[];for(let i=0;i<n;i++)a.push(i);return a;}
for(const n of [-3,-0,0,0.5,1,2.5,20,NaN])console.log(append(n).join(","));
function objects(n:number):number {const a:{x:number}[]=[];for(let i=0;i<n;i++)a.push({x:i});return a.length+a[a.length-1]!.x;}
console.log(objects(100));
function changing(n:number):string {const a:number[]=[];for(let i=0;i<n;i++){n--;a.push(i);}return a.join(",");}
console.log(changing(10));
function stop(n:number):number {const a:number[]=[];for(let i=0;i<n;i++){if(i===3)break;a.push(i);}return a.length;}
console.log(stop(1e100));
function nested(n:number):number {const a:number[]=[];for(let i=0;i<n;i++){for(let j=0;j<3;j++)a.push(j);};return a.length;}
console.log(nested(20));
function length(n:number):string {const a:number[]=[];for(let i=0;i<n;i++){a.push(a.length);};return a.join(",");}
console.log(length(12));
function partial(n:number):string {const a:number[]=[];try{for(let i=0;i<n;i++){if(i===3)throw new Error("stop");a.push(i);}}catch{}return a.join(",");}
console.log(partial(10));
