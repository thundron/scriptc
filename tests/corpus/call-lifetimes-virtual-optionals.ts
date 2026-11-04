class Value {
  amount: number;
  constructor(amount: number) { this.amount = amount; }
}
function extract(value: Value): number { return value.amount; }
class Reader {
  read(value: Value): number { return extract(value); }
  keep(value: Value): Value { return value; }
}
class Middle extends Reader {
  read(value: Value): number { return extract(value) + 1; }
}
class Last extends Middle {
  read(value: Value): number { return extract(value) + 2; }
  keep(value: Value): Value { return value; }
}
class Sibling extends Reader {
  read(value: Value): number { return extract(value) + 3; }
}
function throughBase(reader: Reader, values: Value[], index: number): number {
  const value = values[index];
  return reader.read(value);
}
const readers: Reader[] = [new Reader(), new Middle(), new Last(), new Sibling()];
for (const reader of readers) {
  console.log(throughBase(reader, [new Value(7)], 0));
  try { console.log(throughBase(reader, [], 0)); }
  catch (error) { if (error instanceof Error) console.log(error.name, error.message); }
}

function throughDerived(reader: Last, values: Value[]): number {
  const value = values[0];
  return reader.read(value);
}
console.log(throughDerived(new Last(), [new Value(11)]));
function keepThroughBase(reader: Reader, values: Value[]): Value {
  const value = values[0];
  return reader.keep(value);
}
for (const reader of readers) {
  const values = [new Value(13)];
  const result = keepThroughBase(reader, values);
  console.log(result === values[0], result.amount);
}

abstract class AbstractReader {
  abstract read(value: Value): number;
}
class FirstConcrete extends AbstractReader {
  read(value: Value): number { return extract(value) + 4; }
}
class SecondConcrete extends AbstractReader {
  read(value: Value): number { return extract(value) + 5; }
}
function throughAbstract(reader: AbstractReader, values: Value[]): number {
  const value = values[0];
  return reader.read(value);
}
console.log(throughAbstract(new FirstConcrete(), [new Value(17)]));
console.log(throughAbstract(new SecondConcrete(), [new Value(19)]));
try { console.log(throughAbstract(new SecondConcrete(), [])); }
catch (error) { if (error instanceof Error) console.log(error.name, error.message); }

class PairReader {
  read(left: Value, right: Value): number { return left.amount + right.amount; }
}
class PairChild extends PairReader {
  read(left: Value, right: Value): number { return left.amount - right.amount; }
}
function optionalFirst(reader: PairReader, values: Value[]): number {
  const value = values[0];
  return reader.read(value, new Value(23));
}
console.log(optionalFirst(new PairReader(), [new Value(29)]));
console.log(optionalFirst(new PairChild(), [new Value(31)]));

class Unrelated {
  read(value: Value): number { return value.amount * 2; }
}
console.log(new Unrelated().read(new Value(37)));
