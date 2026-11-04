const values: unknown[] = [0];
function assign(index: any, value: any): any {
  return values[index] = value;
}
console.log(assign(0, 42), values[0]);
console.log(assign("1", "end"), JSON.stringify(values));
