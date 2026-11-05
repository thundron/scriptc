class Box {
  value: number | string = 1;
  get current(): number | string { return this.value; }
  read(): number | string { return this.value; }
}
interface NumericBox extends Box { value: number; readonly current: number; }
// An interface cannot manufacture a native class from a structural mock.
const mock: NumericBox = { value: 1, current: 1, read: () => 1 };
console.log(mock.current);

interface AddedStorage extends Box { extra: string; }
function added(view: AddedStorage): string { return view.extra; }
console.log(added(new Box() as AddedStorage));

interface ChangedMethod extends Box { read(): number; }
function changed(view: ChangedMethod): number { return view.read(); }
console.log(changed(new Box() as ChangedMethod));

type Indexed = Box & { [name: string]: number };
function indexed(view: Indexed, key: string): number { return view[key]!; }
console.log(indexed(new Box() as Indexed, "value"));

class Other {
  other = "other";
}
type Both = Box & Other;
function ambiguous(view: Both): string { return view.other; }
console.log(ambiguous(new Box() as Both));

interface BaseView extends Box {}
const record = { value: 3, current: 3, read: () => 3 };
console.log((record as BaseView).current);

class Mimic {
  value: number | string = 1;
  get current(): number | string { return this.value; }
  read(): number | string { return this.value; }
}
console.log((new Mimic() as BaseView).current);
