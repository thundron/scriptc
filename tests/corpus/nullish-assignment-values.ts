let calls = 0;
function supply(): number { calls++; return 7; }
let empty: number | undefined;
let zero: number | undefined = 0;
console.log(empty ??= supply(), zero ??= supply(), calls);
const values: (number | undefined)[] = [undefined, 0];
let indexes = 0;
function index(): number { indexes++; return 0; }
console.log(values[index()] ??= supply(), values[index()] ??= supply(), indexes, calls);
console.log(values[4] ??= supply(), values.length, calls);
let trace = "";
class Slot {
  stored: number | null = null;
  get value(): number | null { trace += "get;"; return this.stored; }
  set value(value: number | null) { trace += "set;"; this.stored = value; }
}
let slot = new Slot();
const original = slot;
function receiver(): Slot { trace += "receiver;"; return slot; }
function replace(): number { trace += "rhs;"; slot = new Slot(); return 9; }
console.log(receiver().value ??= replace(), original.stored, slot.stored, trace);
trace = "";
console.log(original.value ??= replace(), trace);
const record: { value?: number } = {};
console.log(record.value ??= 4, record.value ??= 5);
let recordGets = 0;
let recordSets = 0;
let saved: string | undefined;
const accessor = {
  get value(): string | undefined { recordGets++; return saved; },
  set value(value: string | undefined) { recordSets++; saved = value; },
};
console.log(accessor.value ??= "kept", accessor.value ??= "unused", recordGets, recordSets);
let absent: undefined;
let nil: null = null;
function supplyUndefined(): undefined { trace += "undefined;"; return undefined; }
function supplyNull(): null { trace += "null;"; return null; }
trace = "";
console.log(absent ??= supplyUndefined(), nil ??= supplyNull(), trace);
