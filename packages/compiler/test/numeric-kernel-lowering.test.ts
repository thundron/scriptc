import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { compile, deserializeModule, validateModule } from "../src/index.js";
import { emitLlvmModuleSource } from "../src/backend/llvm/emitter.js";
import { scalarizeNumericRecords } from "../src/ir/scalar-records.js";
import { fuseNumericMapReductions } from "../src/backend/llvm/numeric-map-reductions.js";
import { scalarizeArrayLiterals } from "../src/backend/llvm/scalar-arrays.js";
import { specializeSmallArrayMaps } from "../src/backend/llvm/small-array-maps.js";
import { eliminatePrivateStackPairs } from "../src/backend/llvm/private-stack-pairs.js";

async function llvm(source: string, mutable = false): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "scriptc-numeric-kernel-"));
  try {
    const entry = join(dir, "main.ts"),
      outPath = join(dir, "main.ir.json");
    await writeFile(entry, source);
    const result = await compile(entry, {
      outDir: dir,
      outPath,
      outputKind: "ir",
      nodeIslands: { mode: "off" },
    });
    if (!result.ok)
      throw new Error(result.diagnostics.map((d) => `${d.code}: ${d.message}`).join("\n"));
    const mod = deserializeModule(await readFile(outPath, "utf8"));
    expect(validateModule(mod)).toEqual([]);
    const closed = scalarizeNumericRecords(mod, true);
    expect(validateModule(closed)).toEqual([]);
    const fused = fuseNumericMapReductions(mod);
    expect(validateModule(fused)).toEqual([]);
    expect(fuseNumericMapReductions(fused)).toBe(fused);
    const scalarized = scalarizeArrayLiterals(
      eliminatePrivateStackPairs(specializeSmallArrayMaps(mod)),
    );
    expect(validateModule(scalarized)).toEqual([]);
    expect(scalarizeArrayLiterals(scalarized)).toBe(scalarized);
    if (mutable) mod.bytesHeadersMutable = true;
    const resultLlvm = emitLlvmModuleSource(mod, { wasi: true, pointerBits: 32 });
    return typeof resultLlvm === "string" ? resultLlvm : resultLlvm.join("");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
const body = (text: string, name: string): string => {
  const match = text.match(
    new RegExp(
      `define internal [^\\n]+ @sc_(?:b)?f_${name}(?:\\.i32)?\\([^\\n]*\\) [^\\n]*#[0-9]+ \\{([\\s\\S]*?)\\n\\}`,
    ),
  );
  expect(match, `missing ${name}`).not.toBeNull();
  return match![1]!;
};

const FILL = `
function fill(a: Float32Array, value: number, start: number, end: number): Float32Array { return a.fill(value, start, end); }
const a = new Float32Array(16);
console.log(fill(a, Number(process.argv[2]), 0, 16) === a, a[0]);
`;
test("fixed typed-array fills have a native loop and a shared-storage fallback", async () => {
  const fn = body(await llvm(FILL), "fill");
  expect(fn).toContain("bytes.fill.body");
  expect(fn).toMatch(/store float/);
  expect(fn).toContain("bytes.fill.slow");
  expect(fn).toContain("@scr_bytes_fill_elem");
});
test("mutable buffers keep the runtime fill validation", async () => {
  const fn = body(await llvm(FILL, true), "fill");
  expect(fn).not.toContain("bytes.fill.body");
  expect(fn).toContain("@scr_bytes_fill_elem");
});
test("two- and three-argument hypot do not allocate argument arrays", async () => {
  const text = await llvm(`
function two(x: number, y: number): number { return Math.hypot(x,y); }
function three(x: number, y: number, z: number): number { return Math.hypot(x,y,z); }
const x = Number(process.argv[2]); console.log(two(x,3),three(x,3,4));
`);
  for (const [name, count] of [
    ["two", 2],
    ["three", 3],
  ] as const) {
    expect(body(text, name)).toContain(`@scr_math_hypot${count}`);
    expect(body(text, name)).not.toMatch(/@scr_arr_new|@scr_math_hypot_arr/);
  }
});
test("constant multiplication in an integer loop needs no i64 overflow intrinsic", async () => {
  const text = await llvm(`
function multiply(n: number, out: Float64Array): number {
  let t = 1;
  for (let i = 0; i < n; i++) { t *= 6; out[i] = t; }
  return t;
}
const a = new Float64Array(32); console.log(multiply(Number(process.argv[2]), a));
`);
  expect(body(text, "multiply")).not.toContain("@llvm.smul.with.overflow.i64");
  expect(body(text, "multiply")).toMatch(/mul nsw i64/);
});

test("small nonescaping numeric literals are scalars, including dynamic reads", async () => {
  const text = await llvm(`
function literal(x: number, index: number): number { const a = [x, x+1, x+2]; return a[index]! + a.length; }
console.log(literal(Number(process.argv[2]), Number(process.argv[3])));
`);
  expect(body(text, "literal")).not.toMatch(/@scr_arr_new|@scr_arr_get|@sc_b?f_.*idxOr/);
});
test("observable identity and mutable literals keep ordinary arrays", async () => {
  const text = await llvm(`
function mutate(x: number, i: number): number { const a = [x,x+1,x+2]; a[i]=4; return a.length; }
function escape(x: number): number[] { return [x,x+1,x+2]; }
console.log(mutate(Number(process.argv[2]),4), escape(5)[0]);
`);
  expect(body(text, "mutate")).toContain("@scr_arr_new");
  expect(body(text, "escape")).toContain("@scr_arr_new");
});
test("discarded private fills need no result retain/release", async () => {
  const text = await llvm(`
function discarded(a:Float64Array, x:number):void {a.fill(x);}
const a=new Float64Array(3);discarded(a,Number(process.argv[2]));console.log(a[0]);
`);
  const fn = body(text, "discarded");
  const fast = fn.slice(fn.indexOf("\nbytes.fill.local"), fn.indexOf("\nbytes.fill.slow"));
  expect(fast).not.toMatch(/@scr_bytes_(?:retain|release)/);
});

test("loop-local fixed-slot writes also scalarize", async () => {
  const text = await llvm(`
function nested(n:number):number {let sum=0;for(let i=0;i<n;i++){const a=[i,i+1,i+2];a[1]=-0;sum+=a[i%3]!;}return sum;}
console.log(nested(Number(process.argv[2])));
`);
  expect(body(text, "nested")).not.toMatch(/@scr_arr_new|@scr_arr_get|@sc_b?f_.*idxOr/);
});

test("small literal maps remove the source array, helper loop and unobserved result", async () => {
  const text = await llvm(`
function mapping(x:number):number {const a=[0,1,2].map((i,index)=>x+i+index);return a[0]!+a[1]!+a[2]!;}
console.log(mapping(Number(process.argv[2])));
`);
  expect(body(text, "mapping")).not.toMatch(/@scr_arr_new|@sc_b?f_.*arr_map/);
});
test("map callbacks observing their array keep the source object", async () => {
  const text = await llvm(`
function observing(x:number):number {const a=[x,2,3].map((v,i,source)=>{source[2]=7;return v+source.length;});return a[0]!;}
console.log(observing(Number(process.argv[2])));
`);
  expect(body(text, "observing")).toContain("@scr_arr_new");
});
test("balanced private numeric push/pop pairs have no array operations", async () => {
  const text = await llvm(`
function paired(n:number):number {const a:number[]=[];let sum=0;for(let i=0;i<n;i++){a.push(i);sum+=a.pop()!;}return sum;}
console.log(paired(Number(process.argv[2])));
`);
  expect(body(text, "paired")).not.toMatch(
    /@scr_arr_new|@scr_arr_push|@scr_arr_pop|arr\.push|arr\.pop/,
  );
});
test("observable or unbalanced stacks keep dense array paths", async () => {
  const text = await llvm(`
function growing(n:number):number {const a:number[]=[];for(let i=0;i<n;i++)a.push(i);return a.length;}
console.log(growing(Number(process.argv[2])));
`);
  expect(body(text, "growing")).toContain("@scr_arr_new");
});

test("fresh counted append loops reserve bounded capacity without changing length", async () => {
  const text = await llvm(`
function append(n:number):number[] {const a:number[]=[];for(let i=0;i<n;i++)a.push(i);return a;}
console.log(append(Number(process.argv[2])).join(','));
`);
  expect(body(text, "append")).toContain("@scr_arr_reserve_len");
  expect(body(text, "append")).toContain("@llvm.ceil.f64");
});
test("rebound loop bounds do not get speculative append reservations", async () => {
  const text = await llvm(`
function changing(n:number):number[] {const a:number[]=[];for(let i=0;i<n;i++){n--;a.push(i);}return a;}
console.log(changing(Number(process.argv[2])).join(','));
`);
  expect(body(text, "changing")).not.toContain("@scr_arr_reserve_len");
});

test("observed source stacks keep map helper frames", async () => {
  const text = await llvm(`
function traced(x:number):number {const a=[0,1,2].map(v=>x+v);console.log(new Error().stack);return a[0]!;}
console.log(traced(Number(process.argv[2])));
`);
  expect(body(text, "traced")).toContain("@scr_arr_new");
});

test("computed reads of expression-local numeric literals use scalar payload and presence", async () => {
  const text = await llvm(`
function direct(x:number,y:number,z:number,i:number):number {return [x,y,z][i%3] ?? -1;}
function named(x:number,y:number,z:number,i:number):number {const a=[x,y,z];return a[i%3] ?? -1;}
console.log(direct(1,2,3,Number(process.argv[2])),named(1,2,3,Number(process.argv[2])));
`);
  for (const name of ["direct", "named"])
    expect(body(text, name)).not.toMatch(/@scr_arr_new|@scr_union_new/);
});
test("variadic numeric pushes have a batched dense store path", async () => {
  const text = await llvm(`
function batch(a:number[],x:number):number {return a.push(x,x+1,x+2,x+3,x+4,x+5);}
const a:number[]=[];console.log(batch(a,Number(process.argv[2])),a.join(','));
`);
  expect(body(text, "batch")).toContain("arr.push.batch");
});

test("numeric map followed by min or max fuses without its result array", async () => {
  const text = await llvm(`
interface Kid { n:number; }
function reduce(kids:Kid[],bounds:Float64Array):number {return Math.min(...kids.map(c=>bounds[c.n*3]!))+Math.max(...kids.map(c=>bounds[c.n*3+1]!));}
console.log(reduce([{n:0},{n:1}],new Float64Array([1,2,3,4,5,6])));
`);
  expect(text).toContain("numeric.reduce");
});

test("affine index locals preserve wide integer views without replacing their doubles", async () => {
  const text = await llvm(`
function affine(a:Float64Array,n:number):number {let sum=0;for(let t=0;t<n;t++){const base=t*3;sum+=a[base+1]!;}return sum;}
console.log(affine(new Float64Array([1,2,3,4,5,6]),Number(process.argv[2])));
`);
  expect(text).toContain("; wide integer base");
});

test("private stack batch congruence proves dominated pops but not aliased or caught stacks", async () => {
  const text = await llvm(`
function triples(n:number):number {const s=[0,0,n];let sum=0;while(s.length){const hi=s.pop()!,lo=s.pop()!,node=s.pop()!;sum+=hi+lo+node;if(hi>1)s.push(node+1,lo,hi-1,node+2,lo,1);}return sum;}
function aliased(n:number):number {const s=[0,0,n],other=s;let sum=0;while(other.length){sum+=s.pop()!;}return sum;}
function caught(n:number):number {const s=[0,0,n];let sum=0;try{while(s.length){const hi=s.pop()!,lo=s.pop()!,node=s.pop()!;sum+=hi+lo+node;}}catch{return s.length;}return sum;}
console.log(triples(3),aliased(3),caught(3));
`);
  expect(body(text, "triples")).toContain("arr.pop.nonempty");
  expect(body(text, "aliased")).not.toContain("arr.pop.nonempty");
  expect(body(text, "caught")).not.toContain("arr.pop.nonempty");
});

test("field-only numeric tuples returned by bounded captured closures scalarize", async () => {
  const text = await llvm(`
function choose(a:Float64Array,n:number):number {const pick=(j:number):[number,number]=>{let best=Infinity,at=-1;for(let k=0;k<j;k++){const v=a[k]!;if(v<best){best=v;at=k;}}return [best,at];};let total=0;for(let i=1;i<n;i++){const [best,at]=pick(i);total+=best+at;}return total;}
console.log(choose(new Float64Array([7,4,2,9]),Number(process.argv[2])));
`);
  expect(body(text, "choose")).toContain("_x25_scalar_");
  expect(body(text, "choose")).not.toContain("; pick");
});

test("observed stacks retain captured numeric-result call boundaries", async () => {
  const text = await llvm(`
function boundary(a:Float64Array,n:number):number {const pick=(j:number):[number,number]=>{let best=Infinity,at=-1;for(let k=0;k<j;k++){const value=a[k]!;if(value<best){best=value;at=k;}}return [best,at];};const [best,at]=pick(n);return best+at;}
console.log(boundary(new Float64Array([3,1]),Number(process.argv[2])),new Error().stack);
`);
  expect(body(text, "boundary")).not.toContain("_x25_scalar_");
});
