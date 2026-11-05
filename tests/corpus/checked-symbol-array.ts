function read(value: unknown): (string | symbol)[] {
  return value as (string | symbol)[];
}
const key = Symbol.for("checked-symbol-array");
const values: (string | symbol)[] = ["name", key];
const result = read(values);
console.log(result.length, result[0] === "name", result[1] === key);
