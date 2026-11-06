type Sofa = {seats?: number; depth?: number};
type Bed = {width?: number; head?: string};
type Blocks = {sofa?: Sofa; bed?: Bed};
type Furniture = {name: string} & Blocks;
function merge(base: Furniture, config: Blocks): Furniture {
  const out: Furniture = {...base};
  for (const key of ['sofa', 'bed'] as const) {
    const patch = config[key];
    if (patch) (out as unknown as Record<string, unknown>)[key] = {...(base[key] ?? {}), ...patch};
  }
  return out;
}
function hash(text: string): number {
  let value = 0;
  for (let i = 0; i < text.length; i++) value = (value * 33 + text.charCodeAt(i)) | 0;
  return value;
}
export function run(n: number): number {
  return hash(JSON.stringify(merge({name: 'x', sofa: {seats: 2}}, {sofa: {depth: n}, bed: {width: 160}})));
}
type A = {x: number} | {y: string};
type B = {x: string} | {z: boolean};
export function product(left: number, right: number): number {
  let count = 0;
  function tick(): number { return ++count; }
  const a: A = left > 0 ? {x: left} : {y: 'r'};
  const b: B = right > 0 ? {x: 'late'} : {z: false};
  return hash(JSON.stringify({before: tick(), ...a, between: tick(), ...b, after: tick()}));
}
