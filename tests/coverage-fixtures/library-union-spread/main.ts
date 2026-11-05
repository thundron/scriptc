interface A { kind: "a"; a?: number }
interface B { kind: "b"; b?: number }
type Choice = A | B;
function merge(base: Choice | undefined, override: Choice | undefined): Choice | undefined {
  if (!override) return base;
  return { ...base, ...override } as Choice;
}
export function run(): number { return merge({kind:"a"}, {kind:"b"}) === undefined ? 0 : 1; }
void run();
