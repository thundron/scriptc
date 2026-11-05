// Class-derived interfaces retain the object and the original member ABI.
class Data {
  raw: number;
  reads = 0;
  mutable: number | string;
  constructor(raw: number) { this.raw = raw; this.mutable = raw; }
  get kind(): number { return 1; }
  get value(): number | string { this.reads++; return this.raw + 1; }
  get optional(): string | undefined { return this.raw > 0 ? "present" : undefined; }
  read(): number { return this.raw; }
  isNumber(): this is NumberData { return typeof this.value === "number"; }
}
interface NumberData extends Data { readonly kind: 1; readonly value: number; mutable: number; }
interface PresentData extends NumberData { readonly optional: string; }
function use(view: NumberData, original: Data): number {
  console.log(view === original, view instanceof Data, view.kind, view.read());
  const value = view.value;
  view.mutable = 8;
  console.log(original.mutable, view.mutable);
  return value;
}
function inspect(view: Data): void {
  if (view.isNumber()) console.log(use(view, view), view.reads);
}
const data = new Data(4);
inspect(data);
const present = data as PresentData;
console.log(present.optional.toUpperCase(), present.value, data.reads);
const items: NumberData[] = [data as NumberData];
console.log(items[0] === data, items[0]!.value, data.reads);
const values = new Map<string, NumberData>();
values.set("data", data as NumberData);
console.log(values.get("data") === data, values.get("data")!.value);
const identities = new Set<NumberData>();
identities.add(data as NumberData);
identities.add(present);
console.log(identities.size, identities.has(data as NumberData));

type LiteralView = Data & { readonly kind: 1; readonly value: number };
function intersection(view: LiteralView): number { return view.value + view.read(); }
console.log(intersection(data as LiteralView), data.reads);

class Box<T> {
  value: T;
  constructor(value: T) { this.value = value; }
  get current(): T { return this.value; }
  replace(value: T): void { this.value = value; }
}
interface BoxView<T> extends Box<T> {}
interface DeepBox<T> extends BoxView<T> {}
function numberBox(view: DeepBox<number>): void { console.log(view.current); view.replace(12); }
function stringBox(view: DeepBox<string>): void { console.log(view.current.toUpperCase()); view.replace("after"); }
const n = new Box(7);
const s = new Box("before");
numberBox(n);
stringBox(s);
console.log(n.current, s.current);
function generic<T>(view: DeepBox<T>): T { return view.current; }
console.log(generic(n), generic(s));
const list = new Box([1, 2]);
const listView: DeepBox<number[]> = list;
listView.current.push(3);
console.log(generic(listView) === list.value, list.value.join(","));

class Leaf extends Data {
  extra(): string { return "leaf"; }
}
interface LeafView extends Leaf { readonly value: number; }
const leaf: LeafView = new Leaf(9) as LeafView;
console.log(leaf.extra(), leaf.value, leaf instanceof Data, leaf instanceof Leaf);
