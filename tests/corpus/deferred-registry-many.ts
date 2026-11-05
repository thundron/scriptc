function compute(value: number): number { return value + 1; }

const registry0 = { compute };
const registry1 = { compute };
const registry2 = { compute };
const registry3 = { compute };
const registry4 = { compute };
const registry5 = { compute };
const registry6 = { compute };
const registry7 = { compute };
const registry8 = { compute };
const registry9 = { compute };
const registry10 = { compute };
const registry11 = { compute };
const registry12 = { compute };
const registry13 = { compute };
const registry14 = { compute };
const registry15 = { compute };
const registry16 = { compute };
const registry17 = { compute };
const registry18 = { compute };
const registry19 = { compute };
const registry20 = { compute };
const registry21 = { compute };
const registry22 = { compute };
const registry23 = { compute };
const registry24 = { compute };
const registry25 = { compute };
const registry26 = { compute };
const registry27 = { compute };
const registry28 = { compute };
const registry29 = { compute };
const registry30 = { compute };
const registry31 = { compute };
const registry32 = { compute };
const registry33 = { compute };
const registry34 = { compute };
const registry35 = { compute };
const registry36 = { compute };
const registry37 = { compute };
const registry38 = { compute };
const registry39 = { compute };
const registry40 = { compute };
const registry41 = { compute };
const registry42 = { compute };
const registry43 = { compute };
const registry44 = { compute };
const registry45 = { compute };
const registry46 = { compute };
const registry47 = { compute };
const registry48 = { compute };
const registry49 = { compute };
const registry50 = { compute };
const registry51 = { compute };
const registry52 = { compute };
const registry53 = { compute };
const registry54 = { compute };
const registry55 = { compute };
const registry56 = { compute };
const registry57 = { compute };
const registry58 = { compute };
const registry59 = { compute };
const registry60 = { compute };
const registry61 = { compute };
const registry62 = { compute };
const registry63 = { compute };

const registries = [
  registry0, registry1, registry2, registry3, registry4, registry5, registry6, registry7,
  registry8, registry9, registry10, registry11, registry12, registry13, registry14, registry15,
  registry16, registry17, registry18, registry19, registry20, registry21, registry22, registry23,
  registry24, registry25, registry26, registry27, registry28, registry29, registry30, registry31,
  registry32, registry33, registry34, registry35, registry36, registry37, registry38, registry39,
  registry40, registry41, registry42, registry43, registry44, registry45, registry46, registry47,
  registry48, registry49, registry50, registry51, registry52, registry53, registry54, registry55,
  registry56, registry57, registry58, registry59, registry60, registry61, registry62, registry63,
];
let total = 0;
for (const registry of registries) total += registry.compute(2);
console.log(registries.length, total, registries[0]!.compute === registries[63]!.compute);
