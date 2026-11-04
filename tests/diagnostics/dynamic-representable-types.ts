// Checked arrays and functions with any pieces compile natively; optional tuple elements retain their diagnostic.
const arr: any[] = [1, "x"];
var evolving = []; // never used — the tsc-clean evolving-array shape
const rec = { workItem: {} as any, width: "10px" };
const fn: (v: any) => string = (v) => String(v);
const bare: any = 41;
const optTuple: [number, string?] = [1];
console.log(arr.length, rec.width, fn(1), bare, optTuple.length);
export const marker: number = 1;
