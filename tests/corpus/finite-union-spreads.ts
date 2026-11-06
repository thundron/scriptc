type OptionalA = {x?: number | undefined};
type OptionalB = {y?: string | undefined};
type Optional = OptionalA | OptionalB;
function optionalMerge(a: Optional | undefined, b: Optional | undefined) {
  return {...(a ?? {}), ...b};
}
const optionalValues: (Optional | undefined)[] = [undefined, {}, {x: 1}, {y: 'last'}, {x: undefined}, {y: undefined}];
for (const a of optionalValues) for (const b of optionalValues) {
  const value = optionalMerge(a, b);
  console.log(JSON.stringify(value), Object.keys(value).join(','), 'x' in value, 'y' in value);
}

type A = {left: number} | {right: string};
type B = {top: boolean} | {bottom: number};
function product(a: A, b: B) { return {...a, ...b}; }
const as: A[] = [{left: 2}, {right: 'r'}];
const bs: B[] = [{top: true}, {bottom: 3}];
for (const a of as) for (const b of bs) {
  const value = product(a, b);
  console.log(JSON.stringify(value), Object.keys(value).join(','));
}

type First = {x: number} | {y: number};
type Last = {x: string} | {z: boolean};
function overwrite(a: First, b: Last) { return {...a, ...b}; }
const firsts: First[] = [{x: 1}, {y: 2}];
const lasts: Last[] = [{x: 'last'}, {z: false}];
for (const a of firsts) for (const b of lasts) console.log(JSON.stringify(overwrite(a, b)));

type Ordered = {a: number; b: number} | {c: string};
function ordered(reverse: boolean): Ordered { return reverse ? {b: 2, a: 1} : {a: 1, b: 2}; }
function orderMerge(a: Ordered, b: B) { return {...a, ...b}; }
for (const reverse of [false, true]) for (const b of bs) {
  const value = orderMerge(ordered(reverse), b);
  console.log(JSON.stringify(value), Object.keys(value).join(','));
}

type OtherOrder = {d: number; e: number} | {f: boolean};
function otherOrder(reverse: boolean): OtherOrder { return reverse ? {e: 4, d: 3} : {d: 3, e: 4}; }
function bothOrders(a: Ordered, b: OtherOrder) { return {...a, ...b}; }
function sameOrders(a: Ordered, b: Ordered) { return {...a, ...b}; }
for (const left of [false, true]) for (const right of [false, true]) {
  const both = bothOrders(ordered(left), otherOrder(right));
  const same = sameOrders(ordered(left), ordered(right));
  console.log(JSON.stringify(both), Object.keys(both).join(','), JSON.stringify(same), Object.keys(same).join(','));
}

type OptionalPair = {a?: number | undefined; b?: number | undefined} | {c?: string};
const pairs: OptionalPair[] = [{a: 1}, {b: 2}, {b: 2, a: 1}, {a: 1, b: 2}, {a: undefined}, {c: 'c'}, {}];
function pairMerge(a: OptionalPair, b: OptionalPair) { return {...a, ...b}; }
for (const a of pairs) for (const b of pairs) {
  const value = pairMerge(a, b);
  console.log(JSON.stringify(value), Object.keys(value).join(','));
}

type Live = {kind: 'a'; x: number; ref: {n: number}; opt?: number} |
  {kind: 'b'; y: string; ref: {n: number}; opt?: number};
let trace = '', short = 'early';
function mark(): number { trace += 'p'; return trace.length; }
function next(a: Live, b: B): B {
  trace += 's'; short = 'late';
  if (a.kind === 'a') a.x += 100; else a.y += '!';
  a.ref.n++;
  return b;
}
function liveMerge(a: Live, b: B) {
  return {before: mark(), ...a, short, ...next(a, b), after: mark()};
}
const shared = {n: 0};
const narrow: Live = {kind: 'a', x: 7, ref: shared};
const live: Live[] = [narrow, {kind: 'b', y: 'b', ref: shared, opt: 5}];
for (const a of live) for (const b of bs) {
  trace = ''; short = 'early';
  const result = liveMerge(a, b);
  console.log(JSON.stringify(result), Object.keys(result).join(','), trace, short, result.ref === shared);
}
console.log(narrow.x, shared.n);

let prefix = 0;
function touch(): number { prefix++; return prefix; }
function source(a: First): First { prefix += 10; return a; }
function prefixMerge(a: First, b: Last) { return {start: touch(), ...source(a), mid: touch(), ...b, end: touch()}; }
for (const a of firsts) for (const b of lasts) console.log(JSON.stringify(prefixMerge(a, b)), prefix);

const frozen = Object.freeze({a: 1, b: 2});
const copied = orderMerge(frozen, {top: true});
if ('a' in copied) copied.a = 99;
console.log(JSON.stringify(copied), JSON.stringify(frozen));
function failed(): B { trace += 'throw'; throw new Error('stop'); }
function throwing(a: A) { return {...a, before: mark(), ...failed(), after: mark()}; }
trace = '';
try { throwing({left: 1}); } catch (error) { console.log(error instanceof Error, trace); }
function choose(value: boolean): boolean { trace += 'c'; return value; }
function conditionalMerge(left: boolean, right: boolean) {
  return {before: mark(), ...(choose(left) ? {a: mark()} : {b: mark()}), middle: mark(), ...(choose(right) ? {c: mark()} : {d: mark()}), after: mark()};
}
for (const left of [false, true]) for (const right of [false, true]) {
  trace = '';
  console.log(JSON.stringify(conditionalMerge(left, right)), trace);
}
function boolMerge(a: A | false, b: B) { return {...a, ...b}; }
for (const enabled of [false, true]) for (const b of bs) console.log(JSON.stringify(boolMerge(enabled ? as[0]! : false, b)));
function numeric(a: A, b: B) { return {'10': 10, ...a, ['2']: 2, ...b, ['1']: 1}; }
for (const a of as) for (const b of bs) {
  const value = numeric(a, b);
  console.log(JSON.stringify(value), Object.keys(value).join(','));
}
