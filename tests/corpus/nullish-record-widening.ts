type Size = {w: number; d: number; h: number};
type Appliance = {exterior: Size; niche?: Size & {hMin?: number; hMax?: number}};
function select(a: Appliance): Size { return a.niche ?? a.exterior; }
const a: Appliance = {exterior: {w: 3, d: 4, h: 5}, niche: {w: 1, d: 2, h: 3, hMin: 7}};
const selected = select(a);
console.log(selected.w, selected.d, selected.h);
selected.w = 9;
console.log(a.niche!.w, Object.keys(selected).join(","));
console.log(select({exterior: {w: 6, d: 7, h: 8}}).w);
let calls = 0;
function fallback(): Size { calls++; return {w: 10, d: 11, h: 12}; }
function coalesce(value: (Size & {extra: number}) | null | undefined): Size { return value ?? fallback(); }
console.log(coalesce({w: 1, d: 2, h: 3, extra: 4}).w, calls);
console.log(coalesce(null).w, calls);
console.log(coalesce(undefined).w, calls);
