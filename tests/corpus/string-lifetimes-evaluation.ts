let text = "old";
const events: string[] = [];
function replace(next: string): string {
  events.push(next);
  text = next;
  return next;
}
console.log(text === replace("new"), text, events.join(","));
text = "base";
console.log(text + replace("tail"), text);
text = "z";
console.log(text < replace("a"), text);
text = "abc";
function position(): number {
  text = "replacement";
  return 1;
}
console.log(text.charAt(position()), text);
text = "prefix-suffix";
function needle(): string {
  text = "changed";
  return "suffix";
}
console.log(text.endsWith(needle()), text);
let search = "b";
function offset(): number {
  search = "x";
  return 0;
}
console.log("abc".indexOf(search, offset()), search);
class Holder {
  value: string;
  constructor(value: string) { this.value = value; }
}
const holder = new Holder("original");
function changeHolder(): string {
  holder.value = "replacement";
  return "!";
}
console.log(holder.value + changeHolder(), holder.value);
const row = { value: "record" };
function changeRecord(): string {
  row.value = "updated";
  return "record";
}
console.log(row.value === changeRecord(), row.value);
function localAssignment(): string {
  let local = "first";
  const result = local + (local = "second");
  return result + ":" + local;
}
console.log(localAssignment());
function captured(): string {
  let local = "captured";
  const mutate = (): string => { local = "changed"; return "captured"; };
  const result = local === mutate();
  return String(result) + ":" + local;
}
console.log(captured());
function read(value: string, unused: string): string {
  return value.slice(0, 20) + ":" + unused;
}
text = "snapshot";
console.log(read(text, replace("later")), text);
const permanent = "permanent";
console.log(permanent + replace("after"), permanent);
function nested(): string {
  let value = "left";
  return value + ((value = "middle") + (value = "right"));
}
console.log(nested());
// Heap strings can have spare append capacity; reusing one must preserve it.
function appendTwice(value: string): string { return value + ":" + value; }
function heapAliases(): void {
  const heap = "<" + String(7) + ">";
  console.log(appendTwice(heap), heap);
}
heapAliases();
