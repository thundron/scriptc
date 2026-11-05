class Result {
  value: number;
  constructor(value: number) { this.value = value; }
  toJSON() { return { result: this.value }; }
}
function encode(value: object): void {
  console.log(JSON.stringify(value));
  console.log(JSON.stringify({ nested: value }));
}
encode(new Result(42));
