class Value {
  readonly value: number;
  constructor(value: number) {
    this.value = value;
  }
}

const collect = (...values: (Value | undefined | null)[]): Value[] =>
  values.filter((value) => value !== undefined && value !== null);
const first = new Value(1);
const second = new Value(2);
const result = collect(undefined, first, null, second);
console.log(result.map((value) => value.value).join(","), result[0] === first, result[1] === second);
console.log(collect().length);

// Unchecked inputs widen the elements of a rest pack, never the pack itself.
const inputs: Value[] = [first];
const missing = inputs[10];
const fromReads = collect(inputs[0], missing, second);
console.log(fromReads.map((value) => value.value).join(","), fromReads.length);

class Collector {
  report(label: string, ...values: Value[]): void {
    console.log(label, values.length, values[0] === undefined, values[1] === undefined);
    for (const value of values) console.log(value === undefined ? "missing" : value.value);
  }
}
const collector = new Collector();
collector.report("first", missing, second);
collector.report("later", first, missing);
collector.report("empty");

class DerivedCollector extends Collector {
  report(label: string, ...values: Value[]): void {
    super.report(label, ...values);
  }
}
function throughBase(value: Collector): void { value.report("virtual", inputs[10], first); }
throughBase(new DerivedCollector());

function reportValues(...values: Value[]): void {
  for (const value of values) console.log("function", value === undefined ? "missing" : value.value);
}
reportValues(inputs[10], first);
