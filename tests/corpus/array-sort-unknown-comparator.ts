class Hit {
  distance: number;
  label: string;
  constructor(distance: number, label: string) { this.distance = distance; this.label = label; }
}
function compare(a: unknown, b: unknown): number {
  return (a as Hit).distance - (b as Hit).distance;
}
const first = new Hit(3, 'far'), second = new Hit(1, 'near'), third = new Hit(1, 'tie');
const values = [first, second, third];
console.log('identity', values.sort(compare) === values);
for (const item of values) console.log(item.label, item.distance);
const copy = values.toSorted(compare);
console.log('copy', copy !== values, copy[0] === second);
function numeric(a: unknown, b: unknown): number { return Number(a) - Number(b); }
console.log([9, 1, 3].sort(numeric).join(','));
